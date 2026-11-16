/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  ArrowLeft,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Flame,
  Swords,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Users,
  Globe,
  Loader2,
  Copy,
  Check,
  Wifi,
  Gamepad2,
} from 'lucide-react';
import { cn } from '../utils';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import scorpioIdleUrl from '../assets/images/scorpio_idle_1794839498627.jpg';
import scorpioPunchUrl from '../assets/images/scorpio_punch_1794839499113.jpg';
import scorpioKickUrl from '../assets/images/scorpio_kick_1794839499547.jpg';
import scorpioSpecialUrl from '../assets/images/scorpio_special_1794839499934.jpg';
import scorpioBlockUrl from '../assets/images/scorpio_block_1794841146232.jpg';
import scorpioVictoryUrl from '../assets/images/scorpio_victory_1794841146961.jpg';
import scorpioUppercutUrl from '../assets/images/scorpio_uppercut_1794843721746.jpg';
import scorpioCrouchUrl from '../assets/images/scorpio_crouch_1794843721917.jpg';
import scorpioHitUrl from '../assets/images/scorpio_hit_1794843722062.jpg';
import scorpioFallUrl from '../assets/images/scorpio_fall_1794845220217.jpg';
import kamenIdleUrl from '../assets/images/kamen_idle_1794839936814.jpg';
import kamenPunchUrl from '../assets/images/kamen_punch_1794839937754.jpg';
import kamenKickUrl from '../assets/images/kamen_kick_1794839938900.jpg';
import kamenSpecialUrl from '../assets/images/kamen_special_1794839939450.jpg';
import kamenBlockUrl from '../assets/images/kamen_block_1794841262965.jpg';
import kamenVictoryUrl from '../assets/images/kamen_victory_1794841147205.jpg';
import kamenUppercutUrl from '../assets/images/kamen_uppercut_1794843722826.jpg';
import kamenCrouchUrl from '../assets/images/kamen_crouch_1794843723530.jpg';
import kamenHitUrl from '../assets/images/kamen_hit_1794843722819.jpg';
import kamenFallUrl from '../assets/images/kamen_fall_1794845220599.jpg';
import kamenActWindupUrl from '../assets/images/kamen_act_windup_1794846137692.jpg';
import kamenPunchMidUrl from '../assets/images/kamen_punch_mid_1794846138957.jpg';
import kamenPunchFollowUrl from '../assets/images/kamen_punch_follow_1794846138932.jpg';
import kamenActRecoverUrl from '../assets/images/kamen_act_recover_1794846139326.jpg';
import kamenKickChamberUrl from '../assets/images/kamen_kick_chamber_1794846140814.jpg';
import kamenKickSnapUrl from '../assets/images/kamen_kick_snap_1794846141173.jpg';
import kamenKickRetractUrl from '../assets/images/kamen_kick_retract_1794846142026.jpg';
import kamenUpperCoilUrl from '../assets/images/kamen_upper_coil_1794846143043.jpg';
import kamenUpperRiseUrl from '../assets/images/kamen_upper_rise_1794846142772.jpg';
import kamenUpperPeakUrl from '../assets/images/kamen_upper_peak_1794846142998.jpg';
import kamenSpecialChargeUrl from '../assets/images/kamen_special_charge_1794846144451.jpg';
import kamenSpecialLaunchUrl from '../assets/images/kamen_special_launch_1794846146526.jpg';
import knightIdleUrl from '../assets/images/knight_idle_1794840562402.jpg';
import knightAttackUrl from '../assets/images/knight_attack_1794840563554.jpg';
import knightKickUrl from '../assets/images/knight_kick_1794841141597.jpg';
import knightSpecialUrl from '../assets/images/knight_special_1794841141458.jpg';
import knightUppercutUrl from '../assets/images/knight_uppercut_1794843725641.jpg';
import knightCrouchUrl from '../assets/images/knight_crouch_1794843725644.jpg';
import knightHitUrl from '../assets/images/knight_hit_1794843726810.jpg';
import knightBlockUrl from '../assets/images/knight_block_1794845223062.jpg';
import knightFallUrl from '../assets/images/knight_fall_1794845220461.jpg';
import knightVictoryUrl from '../assets/images/knight_victory_1794843725583.jpg';
import bisopIdleUrl from '../assets/images/bisop_idle_1794840565585.jpg';
import bisopAttackUrl from '../assets/images/bisop_attack_1794840566355.jpg';
import bisopPunchUrl from '../assets/images/bisop_punch_1794841143042.jpg';
import bisopSpecialUrl from '../assets/images/bisop_special_1794841143469.jpg';
import bisopUppercutUrl from '../assets/images/bisop_uppercut_1794843727060.jpg';
import bisopCrouchUrl from '../assets/images/bisop_crouch_1794843737841.jpg';
import bisopHitUrl from '../assets/images/bisop_hit_1794843728271.jpg';
import bisopBlockUrl from '../assets/images/bisop_block_1794845222814.jpg';
import bisopFallUrl from '../assets/images/bisop_fall_1794845222325.jpg';
import bisopVictoryUrl from '../assets/images/bisop_victory_1794843727245.jpg';
import queenIdleUrl from '../assets/images/queen_idle_1794840565562.jpg';
import queenAttackUrl from '../assets/images/queen_attack_1794840568272.jpg';
import queenPunchUrl from '../assets/images/queen_punch_1794841144254.jpg';
import queenSpecialUrl from '../assets/images/queen_special_1794841144544.jpg';
import queenUppercutUrl from '../assets/images/queen_uppercut_1794843729505.jpg';
import queenHitUrl from '../assets/images/queen_hit_1794843730592.jpg';
import queenBlockUrl from '../assets/images/queen_block_1794845223244.jpg';
import queenFallUrl from '../assets/images/queen_fall_1794845222194.jpg';
import queenVictoryUrl from '../assets/images/queen_victory_1794843738985.jpg';
import virusIdleUrl from '../assets/images/virus_idle_1794843717127.jpg';
import virusPunchUrl from '../assets/images/virus_punch_1794843718281.jpg';
import virusCrouchUrl from '../assets/images/virus_crouch_1794843718241.jpg';
import virusBlockUrl from '../assets/images/virus_block_1794845225204.jpg';
import virusFallUrl from '../assets/images/virus_fall_1794845222338.jpg';
import virusVictoryUrl from '../assets/images/virus_victory_1794843719481.jpg';
import menuBannerUrl from '../assets/images/menu_banner_kombat_1794843714129.jpg';
import arenaCourtyardUrl from '../assets/images/arena_courtyard_1794842649485.jpg';
import arenaPitUrl from '../assets/images/arena_pit_1794842650148.jpg';
import arenaThroneUrl from '../assets/images/arena_throne_1794842650958.jpg';
import arenaCyberLabUrl from '../assets/images/arena_cyber_lab_1794843714639.jpg';
import arenaVolcanoUrl from '../assets/images/arena_volcano_1794843715878.jpg';
import arenaIceTempleUrl from '../assets/images/arena_ice_temple_1794843716320.jpg';
import arenaAcidJungleUrl from '../assets/images/arena_acid_jungle_1794843716457.jpg';
import arenaThunderPeakUrl from '../assets/images/arena_thunder_peak_1794843717458.jpg';
import arenaQuantumVoidUrl from '../assets/images/arena_quantum_void_1794843717830.jpg';
import fatalityScorpioVid from '../assets/videos/fatality_scorpio.mp4';
import fatalitySubbyteVid from '../assets/videos/fatality_subbyte.mp4';
import fatalityShaolinVid from '../assets/videos/fatality_shaolin.mp4';
import fatalityRaidenVid from '../assets/videos/fatality_raiden.mp4';
import fatalityCrimsonVid from '../assets/videos/fatality_crimson.mp4';
import fatalityReptileVid from '../assets/videos/fatality_reptile.mp4';
import fatalityRedRangerVid from '../assets/videos/fatality_red_ranger.mp4';
import fatalityKamenVid from '../assets/videos/fatality_kamen_rider.mp4';
import fatalityKnightVid from '../assets/videos/fatality_knight.mp4';
import fatalityBisopVid from '../assets/videos/fatality_bisop.mp4';
import fatalityQueenVid from '../assets/videos/fatality_queen.mp4';
import fatalityVirusVid from '../assets/videos/fatality_virus_rex.mp4';
import fatalityShaoVid from '../assets/videos/fatality_shao.mp4';
import fatalityExtraLaserVid from '../assets/videos/fatality_extra_laser.mp4';
import fatalityExtraCycloneVid from '../assets/videos/fatality_extra_cyclone.mp4';
import fatalityExtraInfernoVid from '../assets/videos/fatality_extra_inferno.mp4';
import fatalityExtraCryoVid from '../assets/videos/fatality_extra_cryo.mp4';
import fatalityExtraThunderVid from '../assets/videos/fatality_extra_thunder.mp4';
import fatalityExtraDimensionVid from '../assets/videos/fatality_extra_dimension.mp4';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function formatKombatFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

interface FightingGameProps {
  currentStudent?: any;
  isAdmin?: boolean;
  onExit: () => void;
  onFirestoreError?: (err: unknown, op: string, path: string) => void;
}

type FighterId =
  | 'scorpio'
  | 'subbyte'
  | 'shaolin'
  | 'raiden'
  | 'crimson'
  | 'reptile'
  | 'shao'
  | 'red_ranger'
  | 'kamen_rider'
  | 'knight'
  | 'bisop'
  | 'queen'
  | 'virus_rex';

type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type PoseState =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'crouch'
  | 'block'
  | 'punch'
  | 'kick'
  | 'uppercut'
  | 'sweep'
  | 'special'
  | 'jump_kick'
  | 'hit'
  | 'knockdown'
  | 'dizzy'
  | 'ko'
  | 'victory';

interface FighterProfile {
  id: FighterId;
  name: string;
  codename: string;
  style: string;
  specialName: string;
  specialDesc: string;
  fatalityName: string;
  skin: string;
  skinHighlight: string;
  skinShadow: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  suitDark: string;
  pants: string;
  hairOrHat: 'ninja_hood' | 'shaolin_hair' | 'raiden_hat' | 'shao_helm' | 'ranger_helmet' | 'kamen_helmet';
  bareChest?: boolean;
  eyeGlow?: string;
  hasScar?: boolean;
  hasCape?: boolean;
  scale?: number;
  projectileType: 'spear' | 'ice' | 'dragon' | 'lightning' | 'plasma' | 'acid' | 'hammer_wave';
  projectileColor: string;
  projectileCore: string;
  speed: number;
  power: number;
  maxHp: number;
}

const FIGHTERS: Record<FighterId, FighterProfile> = {
  scorpio: {
    id: 'scorpio',
    name: 'SCORPIO BYTE',
    codename: 'Ninja Api Neraka',
    style: 'Hapkido & Ninjutsu Api',
    specialName: 'Kunai Spear',
    specialDesc: 'Melempar tombak kunai berantai yang menarik musuh mendekat!',
    fatalityName: 'TOASTY HELLFIRE',
    skin: '#e0a97d',
    skinHighlight: '#f3c6a0',
    skinShadow: '#a97047',
    primary: '#eab308',
    primaryLight: '#fef08a',
    secondary: '#a16207',
    suitDark: '#121318',
    pants: '#14151b',
    hairOrHat: 'ninja_hood',
    eyeGlow: '#ffffff',
    projectileType: 'spear',
    projectileColor: '#f59e0b',
    projectileCore: '#fef08a',
    speed: 4.5,
    power: 1.05,
    maxHp: 100,
  },
  subbyte: {
    id: 'subbyte',
    name: 'SUB-BYTE ZERO',
    codename: 'Ninja Es Lin Kuei',
    style: 'Shotokan & Cryo',
    specialName: 'Ice Ball',
    specialDesc: 'Bola kristal es yang memperlambat gerakan lawan!',
    fatalityName: 'DEEP FREEZE SHATTER',
    skin: '#e7b993',
    skinHighlight: '#f7d5b8',
    skinShadow: '#b58059',
    primary: '#0284c7',
    primaryLight: '#7dd3fc',
    secondary: '#075985',
    suitDark: '#0f172a',
    pants: '#0b1120',
    hairOrHat: 'ninja_hood',
    eyeGlow: '#e0f2fe',
    hasScar: true,
    projectileType: 'ice',
    projectileColor: '#38bdf8',
    projectileCore: '#ffffff',
    speed: 4.35,
    power: 1.0,
    maxHp: 105,
  },
  shaolin: {
    id: 'shaolin',
    name: 'LIU ALGORITHM',
    codename: 'Juara Shaolin',
    style: 'Kungfu Naga & Jeet Kune Do',
    specialName: 'Dragon Fireball',
    specialDesc: 'Menembakkan gelombang api naga Shaolin super cepat!',
    fatalityName: 'DRAGON INFERNO',
    skin: '#dfaa7e',
    skinHighlight: '#f2c7a2',
    skinShadow: '#a97146',
    primary: '#dc2626',
    primaryLight: '#fca5a5',
    secondary: '#991b1b',
    suitDark: '#18181b',
    pants: '#18181b',
    hairOrHat: 'shaolin_hair',
    bareChest: true,
    projectileType: 'dragon',
    projectileColor: '#ef4444',
    projectileCore: '#fde047',
    speed: 4.95,
    power: 1.0,
    maxHp: 100,
  },
  raiden: {
    id: 'raiden',
    name: 'RAIDEN VOLT',
    codename: 'Dewa Petir Listrik',
    style: 'Silat & Nan Quan Halilintar',
    specialName: 'Lightning Bolt',
    specialDesc: 'Sambaran petir bertegangan tinggi melintasi arena!',
    fatalityName: 'HEAVENLY THUNDER',
    skin: '#e5b892',
    skinHighlight: '#f5d2b3',
    skinShadow: '#b07e57',
    primary: '#2563eb',
    primaryLight: '#93c5fd',
    secondary: '#1e3a8a',
    suitDark: '#e2e8f0',
    pants: '#f1f5f9',
    hairOrHat: 'raiden_hat',
    eyeGlow: '#60a5fa',
    projectileType: 'lightning',
    projectileColor: '#3b82f6',
    projectileCore: '#ffffff',
    speed: 4.4,
    power: 1.08,
    maxHp: 105,
  },
  crimson: {
    id: 'crimson',
    name: 'ERMAC SYNTAX',
    codename: 'Ninja Jiwa Crimson',
    style: 'Telekinetic Hua Chuan',
    specialName: 'Soul Orb',
    specialDesc: 'Bola energi merah telekinetik',
    fatalityName: 'SOUL CRUSH',
    skin: '#dba076',
    skinHighlight: '#efc09b',
    skinShadow: '#9e6840',
    primary: '#be123c',
    primaryLight: '#fda4af',
    secondary: '#881337',
    suitDark: '#111827',
    pants: '#18181b',
    hairOrHat: 'ninja_hood',
    eyeGlow: '#34d399',
    projectileType: 'plasma',
    projectileColor: '#f43f5e',
    projectileCore: '#a7f3d0',
    speed: 4.15,
    power: 0.96,
    maxHp: 95,
  },
  reptile: {
    id: 'reptile',
    name: 'REPTILE MALWARE',
    codename: 'Siluman Zaterran',
    style: 'Hung Gar & Crab Style',
    specialName: 'Acid Spit',
    specialDesc: 'Semburan cairan asam hijau beracun',
    fatalityName: 'ACID MELTDOWN',
    skin: '#65a30d',
    skinHighlight: '#a3e635',
    skinShadow: '#3f6212',
    primary: '#16a34a',
    primaryLight: '#86efac',
    secondary: '#14532d',
    suitDark: '#09090b',
    pants: '#111827',
    hairOrHat: 'ninja_hood',
    eyeGlow: '#fde047',
    projectileType: 'acid',
    projectileColor: '#22c55e',
    projectileCore: '#ecfccb',
    speed: 4.6,
    power: 1.05,
    maxHp: 105,
  },
  shao: {
    id: 'shao',
    name: 'SHAO TROJAN',
    codename: 'Kaisar Outworld',
    style: 'Tai Tzu & Wrath Hammer',
    specialName: 'Shadow Spear',
    specialDesc: 'Tombak energi kaisar & hantaman palu perang',
    fatalityName: 'EMPEROR ANNIHILATION',
    skin: '#c98a5b',
    skinHighlight: '#e0a97f',
    skinShadow: '#854e28',
    primary: '#991b1b',
    primaryLight: '#f59e0b',
    secondary: '#b45309',
    suitDark: '#1c1917',
    pants: '#18181b',
    hairOrHat: 'shao_helm',
    bareChest: true,
    hasCape: true,
    scale: 1.14,
    eyeGlow: '#ef4444',
    projectileType: 'hammer_wave',
    projectileColor: '#a855f7',
    projectileCore: '#fde047',
    speed: 3.9,
    power: 1.2,
    maxHp: 130,
  },
  red_ranger: {
    id: 'red_ranger',
    name: 'RED RANGER',
    codename: 'Morphin Grid Leader',
    style: 'Tyrannosaurus Karate & Power Sword',
    specialName: 'Power Laser Blaster',
    specialDesc: 'Menembakkan sinar laser merah berdaya rusak tinggi!',
    fatalityName: 'POWER BLAST FINISHER',
    skin: '#e0a97d',
    skinHighlight: '#f3c6a0',
    skinShadow: '#a97047',
    primary: '#dc2626',
    primaryLight: '#fca5a5',
    secondary: '#991b1b',
    suitDark: '#7f1d1d',
    pants: '#b91c1c',
    hairOrHat: 'ranger_helmet',
    eyeGlow: '#ffffff',
    projectileType: 'plasma',
    projectileColor: '#ef4444',
    projectileCore: '#ffffff',
    speed: 4.8,
    power: 1.1,
    maxHp: 110,
  },
  kamen_rider: {
    id: 'kamen_rider',
    name: 'KAMEN RIDER',
    codename: 'Ksatria Topeng Cyclone',
    style: 'Henshin Kick & Hurricane',
    specialName: 'Rider Kick',
    specialDesc: 'Tendangan maut berenergi angin tornado berkecepatan tinggi!',
    fatalityName: 'HENSHIN EXPLOSION',
    skin: '#e0a97d',
    skinHighlight: '#f3c6a0',
    skinShadow: '#a97047',
    primary: '#0284c7',
    primaryLight: '#7dd3fc',
    secondary: '#0369a1',
    suitDark: '#0f172a',
    pants: '#0b1120',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#22c55e',
    projectileType: 'lightning',
    projectileColor: '#38bdf8',
    projectileCore: '#ffffff',
    speed: 5.0,
    power: 1.15,
    maxHp: 115,
  },
  knight: {
    id: 'knight',
    name: 'KNIGHT',
    codename: 'Ksatria Pelindung Zirah',
    style: 'Shadow Lance & Gauntlet Slash',
    specialName: 'Dark Wing Slash',
    specialDesc: 'Tebasan sayap baja berkecepatan tinggi dengan gelombang energi biru!',
    fatalityName: 'FINAL VENT IMPALE',
    skin: '#cbd5e1',
    skinHighlight: '#e2e8f0',
    skinShadow: '#64748b',
    primary: '#1e3a8a',
    primaryLight: '#60a5fa',
    secondary: '#1d4ed8',
    suitDark: '#090d16',
    pants: '#0f172a',
    hairOrHat: 'kamen_helmet',
    hasCape: true,
    eyeGlow: '#38bdf8',
    projectileType: 'lightning',
    projectileColor: '#38bdf8',
    projectileCore: '#e0f2fe',
    speed: 4.9,
    power: 1.15,
    maxHp: 120,
  },
  bisop: {
    id: 'bisop',
    name: 'BISOP',
    codename: 'Ksatria Uskup Zamrud',
    style: 'Diagonal Sacred Strike',
    specialName: 'Bishop Crimson Orb',
    specialDesc: 'Melepaskan bola energi emas-merah berdaya hancur sangat tinggi!',
    fatalityName: 'SANCTUARY JUDGMENT',
    skin: '#d6a37a',
    skinHighlight: '#f3c6a0',
    skinShadow: '#9a5b32',
    primary: '#991b1b',
    primaryLight: '#fbbf24',
    secondary: '#b45309',
    suitDark: '#1c0a0d',
    pants: '#18181b',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#10b981',
    projectileType: 'plasma',
    projectileColor: '#f59e0b',
    projectileCore: '#fef08a',
    speed: 4.7,
    power: 1.2,
    maxHp: 115,
  },
  queen: {
    id: 'queen',
    name: 'QUEEN',
    codename: 'Ratu Ksatria Mahkota',
    style: 'Royal High-Kick & Crown Wave',
    specialName: 'Sovereign Sapphire Kick',
    specialDesc: 'Tendangan akrobatik ratu dengan gelombang energi safir cepat!',
    fatalityName: 'ROYAL CORONATION FINISHER',
    skin: '#f1f5f9',
    skinHighlight: '#ffffff',
    skinShadow: '#94a3b8',
    primary: '#e2e8f0',
    primaryLight: '#fde047',
    secondary: '#dc2626',
    suitDark: '#1e293b',
    pants: '#cbd5e1',
    hairOrHat: 'kamen_helmet',
    hasCape: true,
    eyeGlow: '#06b6d4',
    projectileType: 'ice',
    projectileColor: '#38bdf8',
    projectileCore: '#ffffff',
    speed: 5.3,
    power: 1.12,
    maxHp: 110,
  },
  virus_rex: {
    id: 'virus_rex',
    name: 'TROJAN REX',
    codename: 'Monster Virus Komputer',
    style: 'Cyber Claw & Glitch Overdrive',
    specialName: 'Malware Beam',
    specialDesc: 'Menembakkan gelombang virus korup biner berkecepatan tinggi!',
    fatalityName: 'SYSTEM32 CORRUPTION',
    skin: '#334155',
    skinHighlight: '#64748b',
    skinShadow: '#0f172a',
    primary: '#16a34a',
    primaryLight: '#4ade80',
    secondary: '#991b1b',
    suitDark: '#09090b',
    pants: '#18181b',
    hairOrHat: 'shao_helm',
    scale: 1.07,
    eyeGlow: '#ef4444',
    projectileType: 'acid',
    projectileColor: '#22c55e',
    projectileCore: '#ef4444',
    speed: 4.55,
    power: 1.18,
    maxHp: 125,
  },
};

const ARENAS: { id: StageId; name: string; theme: string; url: string }[] = [
  { id: 1, name: 'Kuil Malam', theme: 'Bulan Purnama', url: arenaCourtyardUrl },
  { id: 2, name: 'Jembatan Jurang', theme: 'Kabut Zamrud', url: arenaPitUrl },
  { id: 3, name: 'Takhta Kaisar', theme: 'Aula Naga Merah', url: arenaThroneUrl },
  { id: 4, name: 'Lab Server Siber', theme: 'Mainframe Digital', url: arenaCyberLabUrl },
  { id: 5, name: 'Kawah Lava', theme: 'Jembatan Magma', url: arenaVolcanoUrl },
  { id: 6, name: 'Kuil Salju', theme: 'Gletser Beku', url: arenaIceTempleUrl },
  { id: 7, name: 'Rawa Beracun', theme: 'Asam Zaterra', url: arenaAcidJungleUrl },
  { id: 8, name: 'Puncak Halilintar', theme: 'Badai Petir', url: arenaThunderPeakUrl },
  { id: 9, name: 'Gerbang Kuantum', theme: 'Portal Kosmik', url: arenaQuantumVoidUrl },
];

const PLAYABLE_IDS: FighterId[] = [
  'scorpio',
  'subbyte',
  'shaolin',
  'raiden',
  'red_ranger',
  'kamen_rider',
  'knight',
  'bisop',
  'queen',
  'virus_rex',
];
const ARCADE_ENEMIES: { fighter: FighterId; stage: StageId; stageName: string }[] = [
  { fighter: 'crimson', stage: 1, stageName: 'KUIL MALAM' },
  { fighter: 'virus_rex', stage: 4, stageName: 'LAB SERVER SIBER' },
  { fighter: 'shao', stage: 3, stageName: 'TAKHTA KAISAR' },
];

// 16-bit SNES WebAudio Synthesizer
class MkAudioSynth {
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private bgmTimer: number | null = null;
  private step = 0;
  public muted = false;

  private ensure() {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.noiseBuf) {
      const len = Math.floor(this.ctx.sampleRate * 0.22);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    return this.ctx;
  }

  public setMuted(m: boolean) {
    this.muted = m;
    if (m) this.stopBgm();
  }

  public playSfx(type: 'punch' | 'kick' | 'heavy' | 'block' | 'fireball' | 'gong' | 'ko' | 'fatality' | 'select') {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    if (type === 'punch' || type === 'kick' || type === 'heavy') {
      if (this.noiseBuf) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = type === 'heavy' ? 950 : type === 'kick' ? 1400 : 1800;
        const g = ctx.createGain();
        g.gain.setValueAtTime(type === 'heavy' ? 0.35 : 0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + (type === 'heavy' ? 0.18 : 0.09));
        src.connect(filt);
        filt.connect(g);
        g.connect(ctx.destination);
        src.start(now);
        src.stop(now + 0.19);
      }
      const osc = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type === 'heavy' ? 185 : 145, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.12);
      g2.gain.setValueAtTime(type === 'heavy' ? 0.32 : 0.2, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(g2);
      g2.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'block') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'fireball') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(175, now + 0.3);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.33);
    } else if (type === 'gong') {
      [110, 165, 220, 277].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.88);
      });
    } else if (type === 'ko' || type === 'fatality') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(type === 'fatality' ? 140 : 190, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + (type === 'fatality' ? 1.15 : 0.72));
      g.gain.setValueAtTime(type === 'fatality' ? 0.34 : 0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (type === 'fatality' ? 1.2 : 0.75));
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (type === 'fatality' ? 1.22 : 0.76));

      if (type === 'fatality') {
        [98, 130.81, 196].forEach((freq, idx) => {
          const fOsc = ctx.createOscillator();
          const fGain = ctx.createGain();
          fOsc.type = idx === 0 ? 'triangle' : 'sawtooth';
          fOsc.frequency.setValueAtTime(freq, now + 0.12);
          fOsc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + 1.15);
          fGain.gain.setValueAtTime(0.14, now + 0.12);
          fGain.gain.exponentialRampToValueAtTime(0.001, now + 1.18);
          fOsc.connect(fGain);
          fGain.connect(ctx.destination);
          fOsc.start(now + 0.12);
          fOsc.stop(now + 1.2);
        });
        if (this.noiseBuf) {
          const nSrc = ctx.createBufferSource();
          nSrc.buffer = this.noiseBuf;
          const nFilt = ctx.createBiquadFilter();
          nFilt.type = 'lowpass';
          nFilt.frequency.value = 820;
          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.32, now + 0.16);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
          nSrc.connect(nFilt);
          nFilt.connect(nGain);
          nGain.connect(ctx.destination);
          nSrc.start(now + 0.16);
          nSrc.stop(now + 0.92);
        }
      }
    } else if (type === 'select') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.05);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  public startBgm() {
    this.stopBgm();
    if (this.muted || typeof window === 'undefined') return;
    const ctx = this.ensure();
    if (!ctx) return;

    const bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 110, 98, 110, 110, 164.81, 146.83, 130.81, 110, 98, 82.41];
    const leadNotes = [220, 0, 261.63, 293.66, 329.63, 0, 293.66, 261.63, 220, 0, 196, 220, 261.63, 293.66, 329.63, 392];

    this.step = 0;
    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const i = this.step % 16;

      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'sawtooth';
      bOsc.frequency.setValueAtTime(bassNotes[i], now);
      bGain.gain.setValueAtTime(0.048, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      bOsc.connect(bGain);
      bGain.connect(this.ctx.destination);
      bOsc.start(now);
      bOsc.stop(now + 0.15);

      const lFreq = leadNotes[i];
      if (lFreq > 0) {
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = 'square';
        lOsc.frequency.setValueAtTime(lFreq, now);
        lGain.gain.setValueAtTime(0.025, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        lOsc.connect(lGain);
        lGain.connect(this.ctx.destination);
        lOsc.start(now);
        lOsc.stop(now + 0.14);
      }

      if (i % 4 === 0 || i % 4 === 2) {
        const dOsc = this.ctx.createOscillator();
        const dGain = this.ctx.createGain();
        dOsc.type = 'triangle';
        dOsc.frequency.setValueAtTime(i % 4 === 0 ? 120 : 210, now);
        dOsc.frequency.exponentialRampToValueAtTime(40, now + 0.06);
        dGain.gain.setValueAtTime(0.055, now);
        dGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        dOsc.connect(dGain);
        dGain.connect(this.ctx.destination);
        dOsc.start(now);
        dOsc.stop(now + 0.08);
      }

      this.step++;
    }, 155);
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

interface FighterRuntime {
  profile: FighterProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  trailHp: number;
  energy: number;
  pose: PoseState;
  poseTimer: number;
  poseDuration: number;
  hasHitCurrentAttack: boolean;
  isBlocking: boolean;
  isCrouching: boolean;
  chillTimer: number;
  comboCount: number;
  comboResetTimer: number;
  walkPhase: number;
  isLocalPlayer?: boolean;
}

type CombatActionName = 'punch' | 'kick' | 'uppercut' | 'sweep' | 'special' | 'fatality' | 'jump';

interface OnlinePlayerSnap {
  x: number;
  y: number;
  facing: 1 | -1;
  pose: PoseState;
  poseTimer: number;
  poseDuration: number;
  isBlocking: boolean;
  isCrouching: boolean;
  attackNonce: number;
  attackAction?: CombatActionName;
}

interface OnlineMatchDoc {
  id: string;
  roomCode: string;
  isPublic: boolean;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  stage: StageId;
  round: number;
  p1Uid: string;
  p1Name: string;
  p1Fighter: FighterId;
  p1Wins: number;
  p2Uid?: string | null;
  p2Name?: string | null;
  p2Fighter?: FighterId | null;
  p2Wins: number;
  winnerSide?: 'p1' | 'p2' | 'draw' | null;
  p2Snap?: OnlinePlayerSnap;
  hostSync?: {
    p1: OnlinePlayerSnap & { hp: number; energy: number; chillTimer: number; comboCount: number };
    p2Hp: number;
    p2Energy: number;
    p2ChillTimer: number;
    p2PoseOverride?: PoseState;
    p2PoseTimer?: number;
    timer: number;
    phase: 'intro' | 'fight' | 'finish_him' | 'fatality_cinematic' | 'round_end';
    phaseTimer: number;
    round: number;
    p1Wins: number;
    p2Wins: number;
    fatalityAttacker?: 'player' | 'enemy' | null;
    fatalityVariantId?: string | null;
    fatalityVariantName?: string | null;
    projectiles: {
      owner: 'player' | 'enemy';
      originX: number;
      x: number;
      y: number;
      vx: number;
      type: FighterProfile['projectileType'];
      color: string;
      core: string;
      damage: number;
      life: number;
    }[];
    bannerEvent?: { id: number; text: string; subtext?: string; color: string; x: number; y: number; scale?: number };
    seq: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

interface Projectile {
  owner: 'player' | 'enemy';
  originX: number;
  x: number;
  y: number;
  vx: number;
  type: FighterProfile['projectileType'];
  color: string;
  core: string;
  damage: number;
  chill?: boolean;
  pull?: boolean;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

interface FloatingBanner {
  text: string;
  subtext?: string;
  color: string;
  x: number;
  y: number;
  life: number;
  scale?: number;
}

const STAGE_W = 800;
const STAGE_H = 450;
const GROUND_Y = 382;
const GRAVITY = 0.78;

// Helper to draw an anatomically tapered muscular limb segment (bicep/forearm/thigh/shin)
function drawTaperedMuscle(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2: number,
  fill: string,
  highlight: string,
  shadow: string
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (x1 + x2) * 0.5 + nx * 1.5;
  const my = (y1 + y2) * 0.5 + ny * 1.5;
  const midR = (r1 + r2) * 0.56;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1 + nx * r1, y1 + ny * r1);
  ctx.quadraticCurveTo(mx + nx * midR, my + ny * midR, x2 + nx * r2, y2 + ny * r2);
  ctx.lineTo(x2 - nx * r2, y2 - ny * r2);
  ctx.quadraticCurveTo(mx - nx * midR, my - ny * midR, x1 - nx * r1, y1 - ny * r1);
  ctx.closePath();

  // Shading gradient across limb muscle
  const grad = ctx.createLinearGradient(x1 + nx * r1, y1 + ny * r1, x1 - nx * r1, y1 - ny * r1);
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.5, fill);
  grad.addColorStop(1, shadow);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

type SpritePoseKey =
  | 'idle'
  | 'punch'
  | 'kick'
  | 'uppercut'
  | 'crouch'
  | 'hit'
  | 'special'
  | 'block'
  | 'fall'
  | 'victory';
type ActionSequenceKey = 'punch' | 'kick' | 'uppercut' | 'special' | 'sweep';
type ChromaMode = 'green' | 'magenta';

interface SpriteFighterConfig {
  chroma: ChromaMode;
  urls: Record<SpritePoseKey, string>;
  actionFrames?: Partial<Record<ActionSequenceKey, string[]>>;
}

interface FatalityVariant {
  id: string;
  name: string;
  url: string;
}

const FATALITY_VIDEO_URLS: Record<FighterId, string> = {
  scorpio: fatalityScorpioVid,
  subbyte: fatalitySubbyteVid,
  shaolin: fatalityShaolinVid,
  raiden: fatalityRaidenVid,
  crimson: fatalityCrimsonVid,
  reptile: fatalityReptileVid,
  red_ranger: fatalityRedRangerVid,
  kamen_rider: fatalityKamenVid,
  knight: fatalityKnightVid,
  bisop: fatalityBisopVid,
  queen: fatalityQueenVid,
  virus_rex: fatalityVirusVid,
  shao: fatalityShaoVid,
};

const EXTRA_FATALITY_VARIANTS: FatalityVariant[] = [
  { id: 'extra_laser', name: 'ORBITAL CYBER LASER', url: fatalityExtraLaserVid },
  { id: 'extra_cyclone', name: 'DOUBLE CYCLONE CRASH', url: fatalityExtraCycloneVid },
  { id: 'extra_inferno', name: 'SOLAR CORE SUPERNOVA', url: fatalityExtraInfernoVid },
  { id: 'extra_cryo', name: 'ABSOLUTE ZERO SHATTER', url: fatalityExtraCryoVid },
  { id: 'extra_thunder', name: 'HIGH-VOLTAGE OVERLOAD', url: fatalityExtraThunderVid },
  { id: 'extra_dimension', name: 'NEON DIMENSION X-SLASH', url: fatalityExtraDimensionVid },
];

const FATALITY_DECK_QUEUE: Partial<Record<FighterId, FatalityVariant[]>> = {};
const LAST_FATALITY_BY_FIGHTER: Partial<Record<FighterId, string>> = {};

function getFatalityPool(fighterId: FighterId): FatalityVariant[] {
  const sig: FatalityVariant = {
    id: `sig_${fighterId}`,
    name: FIGHTERS[fighterId].fatalityName,
    url: FATALITY_VIDEO_URLS[fighterId],
  };
  return [sig, ...EXTRA_FATALITY_VARIANTS];
}

function getFatalityVideoByVariant(fighterId: FighterId, variantId?: string | null): string {
  if (variantId) {
    const extra = EXTRA_FATALITY_VARIANTS.find((v) => v.id === variantId);
    if (extra) return extra.url;
  }
  return FATALITY_VIDEO_URLS[fighterId];
}

function pickRandomFatalityVariant(fighterId: FighterId): FatalityVariant {
  let deck = FATALITY_DECK_QUEUE[fighterId];
  if (!deck || deck.length === 0) {
    const pool = [...getFatalityPool(fighterId)];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const lastId = LAST_FATALITY_BY_FIGHTER[fighterId];
    if (lastId && pool.length > 1 && pool[0].id === lastId) {
      const swapIdx = 1 + Math.floor(Math.random() * (pool.length - 1));
      [pool[0], pool[swapIdx]] = [pool[swapIdx], pool[0]];
    }
    deck = pool;
    FATALITY_DECK_QUEUE[fighterId] = deck;
  }
  const picked = deck.shift()!;
  LAST_FATALITY_BY_FIGHTER[fighterId] = picked.id;
  return picked;
}

const FIGHTER_SPRITE_CONFIG: Partial<Record<FighterId, SpriteFighterConfig>> = {
  scorpio: {
    chroma: 'green',
    urls: {
      idle: scorpioIdleUrl,
      punch: scorpioPunchUrl,
      kick: scorpioKickUrl,
      uppercut: scorpioUppercutUrl,
      crouch: scorpioCrouchUrl,
      hit: scorpioHitUrl,
      special: scorpioSpecialUrl,
      block: scorpioBlockUrl,
      fall: scorpioFallUrl,
      victory: scorpioVictoryUrl,
    },
  },
  kamen_rider: {
    chroma: 'magenta',
    urls: {
      idle: kamenIdleUrl,
      punch: kamenPunchUrl,
      kick: kamenKickSnapUrl,
      uppercut: kamenUppercutUrl,
      crouch: kamenCrouchUrl,
      hit: kamenHitUrl,
      special: kamenSpecialUrl,
      block: kamenBlockUrl,
      fall: kamenFallUrl,
      victory: kamenVictoryUrl,
    },
    actionFrames: {
      punch: [
        kamenIdleUrl,
        kamenActWindupUrl,
        kamenPunchMidUrl,
        kamenPunchUrl,
        kamenPunchFollowUrl,
        kamenActRecoverUrl,
      ],
      kick: [
        kamenIdleUrl,
        kamenKickChamberUrl,
        kamenKickSnapUrl,
        kamenKickUrl,
        kamenKickRetractUrl,
        kamenActRecoverUrl,
      ],
      uppercut: [
        kamenCrouchUrl,
        kamenUpperCoilUrl,
        kamenUpperRiseUrl,
        kamenUppercutUrl,
        kamenUpperPeakUrl,
        kamenActRecoverUrl,
      ],
      special: [
        kamenActWindupUrl,
        kamenSpecialChargeUrl,
        kamenSpecialLaunchUrl,
        kamenSpecialUrl,
        kamenKickUrl,
        kamenActRecoverUrl,
      ],
      sweep: [
        kamenCrouchUrl,
        kamenUpperCoilUrl,
        kamenKickSnapUrl,
        kamenKickRetractUrl,
        kamenCrouchUrl,
        kamenActRecoverUrl,
      ],
    },
  },
  knight: {
    chroma: 'magenta',
    urls: {
      idle: knightIdleUrl,
      punch: knightAttackUrl,
      kick: knightKickUrl,
      uppercut: knightUppercutUrl,
      crouch: knightCrouchUrl,
      hit: knightHitUrl,
      special: knightSpecialUrl,
      block: knightBlockUrl,
      fall: knightFallUrl,
      victory: knightVictoryUrl,
    },
  },
  bisop: {
    chroma: 'magenta',
    urls: {
      idle: bisopIdleUrl,
      punch: bisopPunchUrl,
      kick: bisopAttackUrl,
      uppercut: bisopUppercutUrl,
      crouch: bisopCrouchUrl,
      hit: bisopHitUrl,
      special: bisopSpecialUrl,
      block: bisopBlockUrl,
      fall: bisopFallUrl,
      victory: bisopVictoryUrl,
    },
  },
  queen: {
    chroma: 'magenta',
    urls: {
      idle: queenIdleUrl,
      punch: queenPunchUrl,
      kick: queenAttackUrl,
      uppercut: queenUppercutUrl,
      crouch: queenIdleUrl,
      hit: queenHitUrl,
      special: queenSpecialUrl,
      block: queenBlockUrl,
      fall: queenFallUrl,
      victory: queenVictoryUrl,
    },
  },
  virus_rex: {
    chroma: 'magenta',
    urls: {
      idle: virusIdleUrl,
      punch: virusPunchUrl,
      kick: virusPunchUrl,
      uppercut: virusPunchUrl,
      crouch: virusCrouchUrl,
      hit: virusCrouchUrl,
      special: virusVictoryUrl,
      block: virusBlockUrl,
      fall: virusFallUrl,
      victory: virusVictoryUrl,
    },
  },
};

const FIGHTER_SPRITE_CACHE: Partial<Record<FighterId, Record<SpritePoseKey, HTMLCanvasElement | null>>> = {};
const FIGHTER_ACTION_FRAMES_CACHE: Partial<
  Record<FighterId, Partial<Record<ActionSequenceKey, (HTMLCanvasElement | null)[]>>>
> = {};
const KEYED_URL_CACHE = new Map<string, HTMLCanvasElement>();
const INFLIGHT_URL_LOADS = new Map<string, Promise<HTMLCanvasElement | null>>();

const PREWARMED_VIDEOS = new Set<string>();
function prewarmVideoUrl(url: string) {
  if (!url || PREWARMED_VIDEOS.has(url)) return;
  PREWARMED_VIDEOS.add(url);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'video';
  link.href = url;
  document.head.appendChild(link);
}
function prewarmFatalityVideo(fid: FighterId) {
  if (typeof window === 'undefined') return;
  prewarmVideoUrl(FATALITY_VIDEO_URLS[fid]);
  EXTRA_FATALITY_VARIANTS.forEach((v) => prewarmVideoUrl(v.url));
}

const ARENA_BG_CACHE: Partial<Record<StageId, HTMLCanvasElement>> = {};
const INFLIGHT_ARENA_LOADS = new Map<StageId, Promise<void>>();
let arenaBgInitialized = false;

function prioritizeArenaBackground(stageNum: StageId): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (ARENA_BG_CACHE[stageNum]) return Promise.resolve();
  const existing = INFLIGHT_ARENA_LOADS.get(stageNum);
  if (existing) return existing;

  const arena = ARENAS.find((a) => a.id === stageNum);
  if (!arena) return Promise.resolve();

  const prom = new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = arena.url;

    const bake = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        resolve();
        return;
      }
      const off = document.createElement('canvas');
      off.width = STAGE_W;
      off.height = STAGE_H;
      const octx = off.getContext('2d');
      if (octx) {
        const scale = Math.max(STAGE_W / img.naturalWidth, STAGE_H / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const dx = (STAGE_W - dw) * 0.5;
        const dy = (STAGE_H - dh) * 0.5;
        octx.imageSmoothingEnabled = true;
        octx.imageSmoothingQuality = 'high';
        octx.drawImage(img, dx, dy, dw, dh);

        const scrim = octx.createLinearGradient(0, 0, 0, STAGE_H);
        scrim.addColorStop(0, 'rgba(0,0,0,0.20)');
        scrim.addColorStop(0.55, 'rgba(0,0,0,0.05)');
        scrim.addColorStop(0.84, 'rgba(0,0,0,0.22)');
        scrim.addColorStop(1, 'rgba(0,0,0,0.36)');
        octx.fillStyle = scrim;
        octx.fillRect(0, 0, STAGE_W, STAGE_H);

        ARENA_BG_CACHE[stageNum] = off;
      }
      resolve();
    };

    if (typeof img.decode === 'function') {
      img.decode().then(bake).catch(() => {
        if (img.complete && img.naturalWidth > 0) bake();
        else resolve();
      });
    } else {
      img.onload = bake;
      img.onerror = () => resolve();
    }
  });

  INFLIGHT_ARENA_LOADS.set(stageNum, prom);
  return prom;
}

function ensureArenaBackgroundsLoaded() {
  if (arenaBgInitialized || typeof window === 'undefined') return;
  arenaBgInitialized = true;

  // Load stage 1 first, then stream remaining arenas concurrently in background
  prioritizeArenaBackground(1).then(() => {
    ARENAS.forEach((a) => {
      if (a.id !== 1) prioritizeArenaBackground(a.id);
    });
  });
}

let fighterSpritesInitialized = false;
let spriteLoadedCount = 0;
let spriteTotalCount = 0;
const spriteProgressListeners = new Set<(loaded: number, total: number) => void>();
const countedSpriteDone = new Set<string>();

function notifySpriteProgress() {
  spriteProgressListeners.forEach((cb) => cb(spriteLoadedCount, spriteTotalCount));
}

function getSpriteLoadStatus() {
  return { loaded: spriteLoadedCount, total: spriteTotalCount };
}

function subscribeSpriteLoadProgress(cb: (loaded: number, total: number) => void) {
  spriteProgressListeners.add(cb);
  cb(spriteLoadedCount, spriteTotalCount);
  return () => {
    spriteProgressListeners.delete(cb);
  };
}

const MAX_SPRITE_DIM = 220;

function keyAndCropChromaSprite(img: HTMLImageElement, chroma: ChromaMode): HTMLCanvasElement | null {
  const rawW = img.naturalWidth;
  const rawH = img.naturalHeight;
  if (!rawW || !rawH) return null;

  const scale = Math.min(1, MAX_SPRITE_DIM / Math.max(rawW, rawH));
  const w = Math.max(1, Math.round(rawW * scale));
  const h = Math.max(1, Math.round(rawH * scale));

  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!tctx) return null;

  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(img, 0, 0, w, h);

  const imgData = tctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (rowOffset + x) * 4;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];

      if (chroma === 'green') {
        const maxRB = r > b ? r : b;
        const greenExcess = g - maxRB;

        if (greenExcess >= 32 && g > r * 1.16 && g > b * 1.16) {
          d[idx + 3] = 0;
        } else if (greenExcess >= 12 && g > r * 1.05 && g > b * 1.05) {
          const alphaRatio = 1 - (greenExcess - 12) / 20;
          d[idx + 3] = Math.max(0, Math.min(255, (255 * alphaRatio + 0.5) | 0));
          d[idx + 1] = g < maxRB ? g : maxRB;
        }
      } else {
        const minRB = r < b ? r : b;
        const magentaExcess = minRB - g;

        if (magentaExcess >= 34 && r > g * 1.18 && b > g * 1.18) {
          d[idx + 3] = 0;
        } else if (magentaExcess >= 12 && r > g * 1.07 && b > g * 1.07) {
          const alphaRatio = 1 - (magentaExcess - 12) / 22;
          d[idx + 3] = Math.max(0, Math.min(255, (255 * alphaRatio + 0.5) | 0));
          const cap = g + 10;
          if (r > cap) d[idx] = cap;
          if (b > cap) d[idx + 2] = cap;
        }
      }

      if (d[idx + 3] > 28) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  tctx.putImageData(imgData, 0, 0);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.drawImage(tmp, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

function loadAndKeySpriteUrl(url: string, chroma: ChromaMode, highPriority = false): Promise<HTMLCanvasElement | null> {
  const cacheKey = `${chroma}:${url}`;
  const cached = KEYED_URL_CACHE.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const existingPromise = INFLIGHT_URL_LOADS.get(cacheKey);
  if (existingPromise) return existingPromise;

  const p = new Promise<HTMLCanvasElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    if (highPriority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = url;

    const finalize = () => {
      const cropped = keyAndCropChromaSprite(img, chroma);
      if (cropped) KEYED_URL_CACHE.set(cacheKey, cropped);
      resolve(cropped);
    };

    if (typeof img.decode === 'function') {
      img
        .decode()
        .then(finalize)
        .catch(() => {
          if (img.complete && img.naturalWidth > 0) finalize();
          else resolve(null);
        });
    } else {
      img.onload = finalize;
      img.onerror = () => resolve(null);
    }
  });

  INFLIGHT_URL_LOADS.set(cacheKey, p);
  return p;
}

function emptySpritePoseRecord(): Record<SpritePoseKey, HTMLCanvasElement | null> {
  return {
    idle: null,
    punch: null,
    kick: null,
    uppercut: null,
    crouch: null,
    hit: null,
    special: null,
    block: null,
    fall: null,
    victory: null,
  };
}

function markSpriteDone(chroma: ChromaMode, url: string) {
  const k = `${chroma}:${url}`;
  if (!countedSpriteDone.has(k)) {
    countedSpriteDone.add(k);
    spriteLoadedCount = countedSpriteDone.size;
    notifySpriteProgress();
  }
}

function prioritizeFighterSprites(fid: FighterId) {
  if (typeof window === 'undefined') return;
  const cfg = FIGHTER_SPRITE_CONFIG[fid];
  if (!cfg) return;
  if (!FIGHTER_SPRITE_CACHE[fid]) FIGHTER_SPRITE_CACHE[fid] = emptySpritePoseRecord();

  (Object.keys(cfg.urls) as SpritePoseKey[]).forEach((poseKey) => {
    const url = cfg.urls[poseKey];
    loadAndKeySpriteUrl(url, cfg.chroma, true).then((canvas) => {
      const cache = FIGHTER_SPRITE_CACHE[fid];
      if (cache && canvas) cache[poseKey] = canvas;
      markSpriteDone(cfg.chroma, url);
    });
  });

  if (cfg.actionFrames) {
    if (!FIGHTER_ACTION_FRAMES_CACHE[fid]) FIGHTER_ACTION_FRAMES_CACHE[fid] = {};
    const seqCache = FIGHTER_ACTION_FRAMES_CACHE[fid]!;
    (Object.keys(cfg.actionFrames) as ActionSequenceKey[]).forEach((seqKey) => {
      const urls = cfg.actionFrames![seqKey];
      if (!urls) return;
      if (!seqCache[seqKey]) seqCache[seqKey] = new Array(urls.length).fill(null);
      urls.forEach((url, frameIdx) => {
        loadAndKeySpriteUrl(url, cfg.chroma, true).then((canvas) => {
          if (canvas) seqCache[seqKey]![frameIdx] = canvas;
          markSpriteDone(cfg.chroma, url);
        });
      });
    });
  }
}

function ensureFighterSpritesLoaded() {
  if (fighterSpritesInitialized || typeof window === 'undefined') return;
  fighterSpritesInitialized = true;

  const fighterIds = Object.keys(FIGHTER_SPRITE_CONFIG) as FighterId[];
  const wave1PortraitTasks: { fid: FighterId; poseKey: 'idle' | 'victory'; url: string; chroma: ChromaMode }[] = [];
  const wave2CombatTasks: {
    fid: FighterId;
    poseKey?: SpritePoseKey;
    seqKey?: ActionSequenceKey;
    frameIdx?: number;
    url: string;
    chroma: ChromaMode;
  }[] = [];
  const seenKeys = new Set<string>();

  fighterIds.forEach((fid) => {
    const cfg = FIGHTER_SPRITE_CONFIG[fid];
    if (!cfg) return;
    if (!FIGHTER_SPRITE_CACHE[fid]) FIGHTER_SPRITE_CACHE[fid] = emptySpritePoseRecord();

    (Object.keys(cfg.urls) as SpritePoseKey[]).forEach((poseKey) => {
      const url = cfg.urls[poseKey];
      const uniqKey = `${cfg.chroma}:${url}`;
      seenKeys.add(uniqKey);
      if (poseKey === 'idle' || poseKey === 'victory') {
        wave1PortraitTasks.push({ fid, poseKey, url, chroma: cfg.chroma });
      } else {
        wave2CombatTasks.push({ fid, poseKey, url, chroma: cfg.chroma });
      }
    });

    if (cfg.actionFrames) {
      if (!FIGHTER_ACTION_FRAMES_CACHE[fid]) FIGHTER_ACTION_FRAMES_CACHE[fid] = {};
      const seqCache = FIGHTER_ACTION_FRAMES_CACHE[fid]!;
      (Object.keys(cfg.actionFrames) as ActionSequenceKey[]).forEach((seqKey) => {
        const urls = cfg.actionFrames![seqKey];
        if (!urls) return;
        if (!seqCache[seqKey]) seqCache[seqKey] = new Array(urls.length).fill(null);
        urls.forEach((url, frameIdx) => {
          const uniqKey = `${cfg.chroma}:${url}`;
          seenKeys.add(uniqKey);
          wave2CombatTasks.push({ fid, seqKey, frameIdx, url, chroma: cfg.chroma });
        });
      });
    }
  });

  spriteTotalCount = seenKeys.size;
  spriteLoadedCount = countedSpriteDone.size;
  notifySpriteProgress();

  // Wave 1: Load compressed idle & front victory portraits concurrently for Character Select
  Promise.all(
    wave1PortraitTasks.map(async ({ fid, poseKey, url, chroma }) => {
      const canvas = await loadAndKeySpriteUrl(url, chroma, true);
      const cache = FIGHTER_SPRITE_CACHE[fid];
      if (cache && canvas) cache[poseKey] = canvas;
      markSpriteDone(chroma, url);
    })
  ).then(() => {
    // Wave 2: Load combat & 6-frame action sprites in staggered micro-batches so UI stays crisp at 60fps
    let idx = 0;
    const batchSize = 4;
    const pump = () => {
      const slice = wave2CombatTasks.slice(idx, idx + batchSize);
      idx += batchSize;
      Promise.all(
        slice.map(({ fid, poseKey, seqKey, frameIdx, url, chroma }) =>
          loadAndKeySpriteUrl(url, chroma, false).then((canvas) => {
            if (poseKey) {
              const cache = FIGHTER_SPRITE_CACHE[fid];
              if (cache && canvas) cache[poseKey] = canvas;
            }
            if (seqKey && frameIdx !== undefined) {
              const seqCache = FIGHTER_ACTION_FRAMES_CACHE[fid]?.[seqKey];
              if (seqCache && canvas) seqCache[frameIdx] = canvas;
            }
            markSpriteDone(chroma, url);
          })
        )
      ).then(() => {
        if (idx < wave2CombatTasks.length) {
          setTimeout(pump, 16);
        }
      });
    };
    pump();
  });
}

// Unique Character-Themed Victory Aura & Effects (Shared by AI Sprite & Vector Fighters)
function drawVictoryAura(ctx: CanvasRenderingContext2D, fid: FighterId, time: number, isPortrait = false) {
  ctx.save();
  const s = isPortrait ? 0.85 : 1;
  ctx.scale(s, s);

  if (fid === 'scorpio') {
    // Rising Hellfire flames & floating embers
    for (let i = -2; i <= 2; i++) {
      const flick = Math.sin(time * 0.02 + i * 1.4) * 7;
      const gx = i * 15;
      const g = ctx.createLinearGradient(gx, 0, gx, -125);
      g.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
      g.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
      g.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(gx - 8, 2);
      ctx.quadraticCurveTo(gx + flick, -65, gx - flick * 0.6, -120);
      ctx.quadraticCurveTo(gx + 8, -50, gx + 8, 2);
      ctx.closePath();
      ctx.fill();
    }
  } else if (fid === 'subbyte') {
    // Orbiting faceted ice crystals + cryo ring
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -10, 44, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = time * 0.004 + (i * Math.PI) / 2;
      const cx = Math.cos(a) * 38;
      const cy = -65 + Math.sin(a * 2) * 14;
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 5, cy);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx - 5, cy);
      ctx.closePath();
      ctx.fill();
    }
  } else if (fid === 'shaolin') {
    // Twin spiraling dragon flame ribbons
    for (let k = 0; k < 2; k++) {
      ctx.strokeStyle = k === 0 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(253, 224, 71, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let h = 0; h <= 110; h += 10) {
        const ang = time * 0.01 + h * 0.08 + k * Math.PI;
        const px = Math.cos(ang) * (28 - h * 0.12);
        const py = -h;
        if (h === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else if (fid === 'raiden') {
    // Thunder Halo & crackling cyan lightning bolts
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 3; i++) {
      const phase = time * 0.018 + i * 2.1;
      const rx = Math.sin(phase) * 34;
      ctx.beginPath();
      ctx.moveTo(rx, -140);
      ctx.lineTo(rx * 0.5 + 8, -95);
      ctx.lineTo(rx * 0.7 - 8, -50);
      ctx.lineTo(rx * 0.3, -4);
      ctx.stroke();
    }
  } else if (fid === 'red_ranger') {
    // Morphin Grid Red-Gold Starburst Crest behind hero
    const pulse = 0.8 + Math.sin(time * 0.01) * 0.2;
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.55 * pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -135);
    ctx.lineTo(38, -70);
    ctx.lineTo(0, -10);
    ctx.lineTo(-38, -70);
    ctx.closePath();
    ctx.stroke();
  } else if (fid === 'kamen_rider') {
    // Typhoon Cyclone Wind Rings swirling upward
    for (let i = 0; i < 3; i++) {
      const h = ((time * 0.12 + i * 42) % 120);
      const alpha = 1 - h / 120;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -h, 24 + h * 0.22, 8, 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (fid === 'knight') {
    // Unfurling Spectral Dark-Blue Wings + Blue Lance Aura
    const flap = Math.sin(time * 0.008) * 6;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.28)';
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.75)';
    ctx.lineWidth = 2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(side * 10, -76);
      ctx.quadraticCurveTo(side * 58, -124 + flap, side * 66, -80 + flap);
      ctx.lineTo(side * 42, -56);
      ctx.lineTo(side * 54, -40 + flap * 0.5);
      ctx.lineTo(side * 14, -46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else if (fid === 'bisop') {
    // Sacred Cathedral Golden-Crimson Pillar & Rotating Sigil
    const pillar = ctx.createLinearGradient(-26, 0, 26, 0);
    pillar.addColorStop(0, 'rgba(245, 158, 11, 0)');
    pillar.addColorStop(0.5, 'rgba(245, 158, 11, 0.34)');
    pillar.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = pillar;
    ctx.fillRect(-30, -145, 60, 150);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -135);
    ctx.lineTo(0, -15);
    ctx.moveTo(-24, -108);
    ctx.lineTo(24, -108);
    ctx.stroke();
  } else if (fid === 'queen') {
    // Floating Golden Crown Halo + Sapphire Petals
    const hover = Math.sin(time * 0.01) * 4;
    ctx.strokeStyle = '#fde047';
    ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -126 + hover);
    ctx.lineTo(-20, -140 + hover);
    ctx.lineTo(-8, -132 + hover);
    ctx.lineTo(0, -144 + hover);
    ctx.lineTo(8, -132 + hover);
    ctx.lineTo(20, -140 + hover);
    ctx.lineTo(16, -126 + hover);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = time * 0.004 + (i * Math.PI) / 3;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 40, -68 + Math.sin(a * 2) * 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (fid === 'virus_rex') {
    // Corrupted Digital Glitch Grid & Binary Bits
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-42, -132, 84, 128);
    ctx.font = '900 10px monospace';
    for (let i = 0; i < 4; i++) {
      const yOff = -((time * 0.08 + i * 32) % 120);
      ctx.fillStyle = i % 2 === 0 ? '#4ade80' : '#ef4444';
      ctx.fillText(i % 2 === 0 ? '0101' : 'ERR!', (i % 2 === 0 ? -1 : 1) * 38, yOff);
    }
  } else if (fid === 'crimson') {
    // Telekinetic Crimson Soul Orbs
    for (let i = 0; i < 3; i++) {
      const a = time * 0.005 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(a) * 34;
      const sy = -76 + Math.sin(a) * 12;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (fid === 'reptile') {
    // Bubbling Toxic Green Acid Mist
    for (let i = 0; i < 5; i++) {
      const r = ((time * 0.05 + i * 24) % 90);
      ctx.fillStyle = `rgba(74, 222, 128, ${1 - r / 90})`;
      ctx.beginPath();
      ctx.arc((i - 2) * 15, -r, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (fid === 'shao') {
    // Outworld Imperial Lightning Aura
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -68, 50 + Math.sin(time * 0.015) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Front-Facing Vector Fighter Renderer for KTP Portrait & Spotlight Front Pose
function drawFrontVectorFighter(
  ctx: CanvasRenderingContext2D,
  p: FighterProfile,
  time: number,
  mode: 'bust' | 'front'
) {
  const bob = Math.sin(time * 0.006) * 2;
  ctx.save();

  if (mode === 'bust') {
    // KTP-style close-up headshot & shoulders framed neatly inside 140x140 canvas
    ctx.translate(70, 232 + bob);
    ctx.scale(2.05, 2.05);
  } else {
    // Full-body front heroic stance inside 170x190 Spotlight canvas
    ctx.translate(85, 174 + bob * 0.6);
    const sc = p.scale ? p.scale * 1.12 : 1.18;
    ctx.scale(sc, sc);
    drawVictoryAura(ctx, p.id, time, true);
  }

  // Dynamic Shadow for full-body mode
  if (mode === 'front') {
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cape behind shoulders (Shao)
  if (p.hasCape) {
    const wave = Math.sin(time * 0.008) * 4;
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-19, -98);
    ctx.lineTo(19, -98);
    ctx.lineTo(29 + wave, -8);
    ctx.lineTo(-29 - wave, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Symmetric Legs & Boots (drawn in front view)
  [-12, 12].forEach((lx) => {
    const side = lx < 0 ? -1 : 1;
    drawTaperedMuscle(ctx, lx, -56, lx + side * 4, -28, 9, 6.8, p.pants, '#27272a', '#09090b');
    drawTaperedMuscle(ctx, lx + side * 4, -28, lx + side * 6, -4, 6.8, 5.2, p.pants, '#27272a', '#09090b');
    ctx.fillStyle = p.id === 'shaolin' ? '#f8fafc' : p.suitDark;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(lx + side * 7, -2, 8.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Arms in symmetrical front heroic stance
  const armBase = p.bareChest || p.hairOrHat === 'ninja_hood' ? p.skin : p.suitDark;
  const armHi = p.bareChest || p.hairOrHat === 'ninja_hood' ? p.skinHighlight : '#ffffff';
  const armSh = p.bareChest || p.hairOrHat === 'ninja_hood' ? p.skinShadow : '#94a3b8';

  [-1, 1].forEach((side) => {
    const shX = side * 19;
    const shY = -92;
    const elX = side * 26;
    const elY = -72;
    const haX = side * (p.id === 'raiden' && side === 1 ? 24 : 21);
    const haY = p.id === 'raiden' && side === 1 ? -114 : -56;
    drawTaperedMuscle(ctx, shX, shY, elX, elY, 7.2, 5.5, armBase, armHi, armSh);
    drawTaperedMuscle(ctx, elX, elY, haX, haY, 5.5, 4.5, armBase, armHi, armSh);
    ctx.fillStyle = p.id === 'shaolin' ? '#18181b' : p.primary;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(haX, haY, 5.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Torso Front V-Taper
  const tGrad = ctx.createLinearGradient(-20, -96, 20, -56);
  if (p.bareChest) {
    tGrad.addColorStop(0, p.skinShadow);
    tGrad.addColorStop(0.5, p.skinHighlight);
    tGrad.addColorStop(1, p.skin);
  } else {
    tGrad.addColorStop(0, '#09090b');
    tGrad.addColorStop(0.5, p.suitDark);
    tGrad.addColorStop(1, '#18181b');
  }
  ctx.fillStyle = tGrad;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, -96);
  ctx.quadraticCurveTo(-22, -78, -14, -56);
  ctx.lineTo(14, -56);
  ctx.quadraticCurveTo(22, -78, 20, -96);
  ctx.quadraticCurveTo(0, -100, -20, -96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (!p.bareChest) {
    // Symmetric MK V-Vest or Ranger Diamond
    const vGrad = ctx.createLinearGradient(-18, -96, 18, -58);
    vGrad.addColorStop(0, p.primaryLight);
    vGrad.addColorStop(0.5, p.primary);
    vGrad.addColorStop(1, p.secondary);
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.moveTo(-21, -96);
    ctx.lineTo(-6, -95);
    ctx.lineTo(0, -70);
    ctx.lineTo(6, -95);
    ctx.lineTo(21, -96);
    ctx.lineTo(15, -58);
    ctx.lineTo(-15, -58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (p.hairOrHat === 'ranger_helmet') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -88);
      ctx.lineTo(10, -76);
      ctx.lineTo(0, -64);
      ctx.lineTo(-10, -76);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = p.skinShadow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-13, -84);
    ctx.quadraticCurveTo(-5, -80, 0, -83);
    ctx.quadraticCurveTo(5, -80, 13, -84);
    ctx.moveTo(0, -83);
    ctx.lineTo(0, -63);
    ctx.stroke();

    if (p.id === 'shao') {
      [-18, 18].forEach((sx) => {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(sx, -94, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  }

  // Waist Sash & Tabard
  ctx.fillStyle = p.id === 'shaolin' ? '#dc2626' : p.secondary;
  ctx.fillRect(-15, -58, 30, 6);
  ctx.strokeRect(-15, -58, 30, 6);
  ctx.fillStyle = p.primary;
  ctx.fillRect(-7, -52, 14, 17);
  ctx.strokeRect(-7, -52, 14, 17);

  // Head & Front-Facing Facial Details
  ctx.save();
  ctx.translate(0, -112);

  // Neck
  ctx.fillStyle = p.skinShadow;
  ctx.fillRect(-5, 6, 10, 10);

  // Symmetric Head
  const hGrad = ctx.createRadialGradient(0, -4, 2, 0, -2, 15);
  hGrad.addColorStop(0, p.skinHighlight);
  hGrad.addColorStop(0.7, p.skin);
  hGrad.addColorStop(1, p.skinShadow);
  ctx.fillStyle = hGrad;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-10, -14);
  ctx.quadraticCurveTo(0, -22, 10, -14);
  ctx.quadraticCurveTo(13, -2, 9, 8);
  ctx.quadraticCurveTo(0, 14, 0, 14);
  ctx.quadraticCurveTo(0, 14, -9, 8);
  ctx.quadraticCurveTo(-13, -2, -10, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (p.hairOrHat === 'ninja_hood') {
    // Hood Top
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.quadraticCurveTo(-12, -21, 0, -21);
    ctx.quadraticCurveTo(12, -21, 12, -2);
    ctx.lineTo(8, -7);
    ctx.lineTo(-8, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Symmetric V-shaped Mask
    ctx.fillStyle = p.primary;
    ctx.beginPath();
    ctx.moveTo(-11, -1);
    ctx.lineTo(11, -1);
    ctx.lineTo(9, 10);
    ctx.lineTo(0, 14);
    ctx.lineTo(-9, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Two fierce eyes facing forward
    ctx.fillStyle = p.eyeGlow || '#ffffff';
    ctx.fillRect(-7, -5, 4.5, 2.6);
    ctx.fillRect(2.5, -5, 4.5, 2.6);
    if (p.hasScar) {
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(4.5, -9);
      ctx.lineTo(6.5, -1);
      ctx.stroke();
    }
  } else if (p.hairOrHat === 'shaolin_hair') {
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(0, -23, 12, -4);
    ctx.lineTo(10, -10);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12, -11, 24, 4.5);
    ctx.strokeRect(-12, -11, 24, 4.5);
    // Twin forward eyes + mouth
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-7, -5, 4.5, 2.2);
    ctx.fillRect(2.5, -5, 4.5, 2.2);
    ctx.fillRect(-3.5, 5, 7, 1.8);
  } else if (p.hairOrHat === 'raiden_hat') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -12, 20, 22);
    ctx.fillStyle = p.skin;
    ctx.fillRect(-7, -2, 14, 12);
    ctx.fillStyle = '#60a5fa';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 7;
    ctx.fillRect(-7, -5, 5, 2.8);
    ctx.fillRect(2, -5, 5, 2.8);
    ctx.shadowBlur = 0;

    // Wide Straw Hat front view
    const hatG = ctx.createLinearGradient(0, -29, 0, -7);
    hatG.addColorStop(0, '#fde68a');
    hatG.addColorStop(1, '#b45309');
    ctx.fillStyle = hatG;
    ctx.beginPath();
    ctx.moveTo(-30, -8);
    ctx.lineTo(0, -29);
    ctx.lineTo(30, -8);
    ctx.quadraticCurveTo(0, -4, -30, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (p.hairOrHat === 'shao_helm') {
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-11, -13);
    ctx.lineTo(11, -13);
    ctx.lineTo(10, 6);
    ctx.lineTo(0, 10);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f3f4f6';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(side * 9, -12);
      ctx.quadraticCurveTo(side * 22, -19, side * 19, -31);
      ctx.quadraticCurveTo(side * 12, -20, side * 5, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-7, -6, 5, 3);
    ctx.fillRect(2, -6, 5, 3);
  } else if (p.hairOrHat === 'ranger_helmet') {
    const rGrad = ctx.createLinearGradient(-12, -20, 12, 12);
    rGrad.addColorStop(0, '#f87171');
    rGrad.addColorStop(0.5, '#dc2626');
    rGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.quadraticCurveTo(-13, -20, 0, -20);
    ctx.quadraticCurveTo(13, -20, 11, 2);
    ctx.lineTo(6, 11);
    ctx.lineTo(-6, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-8, -6, 16, 5);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-6, 2, 12, 5);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-5, -18);
    ctx.lineTo(0, -25);
    ctx.lineTo(5, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

// High-Detail Iconic SNES Mortal Kombat Fighter Renderer
function drawHumanFighter(
  ctx: CanvasRenderingContext2D,
  f: FighterRuntime,
  time: number,
  isPortrait = false
) {
  const p = f.profile;
  const sc = p.scale || 1;

  if (FIGHTER_SPRITE_CONFIG[p.id]) {
    ensureFighterSpritesLoaded();
  }

  ctx.save();
  ctx.translate(f.x, f.y);

  // Dynamic Stage Shadow
  if (!isPortrait) {
    const heightAboveGround = Math.max(0, GROUND_Y - f.y);
    const shadowScale = Math.max(0.35, 1 - heightAboveGround / 220);
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.beginPath();
    ctx.ellipse(0, GROUND_Y - f.y + 4, 38 * shadowScale * sc, 10 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const vectorUppercutScale = !FIGHTER_SPRITE_CONFIG[p.id] && f.pose === 'uppercut' ? 1.09 : 1;
  ctx.scale(f.facing * sc * vectorUppercutScale, sc * vectorUppercutScale);

  // Ambient aura effects (Sub-Zero frost, Victory character theme aura)
  if (f.chillTimer > 0) {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
  }
  if (f.pose === 'victory') {
    drawVictoryAura(ctx, p.id, time, isPortrait);
  }

  // Digitized Mortal Kombat SNES Sprite Renderer with Dedicated Poses
  const spriteCfg = FIGHTER_SPRITE_CONFIG[p.id];
  const spriteCache = FIGHTER_SPRITE_CACHE[p.id];
  if (spriteCache && spriteCfg) {
    let poseKey: SpritePoseKey = 'idle';
    if (f.pose === 'block') poseKey = 'block';
    else if (f.pose === 'victory') poseKey = 'victory';
    else if (f.pose === 'uppercut') poseKey = 'uppercut';
    else if (f.pose === 'crouch') poseKey = 'crouch';
    else if (f.pose === 'knockdown' || f.pose === 'ko') poseKey = 'fall';
    else if (f.pose === 'hit' || f.pose === 'dizzy') poseKey = 'hit';
    else if (f.pose === 'punch') poseKey = 'punch';
    else if (f.pose === 'kick' || f.pose === 'jump_kick' || f.pose === 'sweep') poseKey = 'kick';
    else if (f.pose === 'special') poseKey = 'special';

    const hasDedicatedCrouch = spriteCfg.urls.crouch !== spriteCfg.urls.idle && Boolean(spriteCache.crouch);
    const hasDedicatedHit = spriteCfg.urls.hit !== spriteCfg.urls.idle && Boolean(spriteCache.hit);
    const hasDedicatedFall = spriteCfg.urls.fall !== spriteCfg.urls.idle && Boolean(spriteCache.fall);
    const hasDedicatedBlock = spriteCfg.urls.block !== spriteCfg.urls.idle && Boolean(spriteCache.block);
    const hasDedicatedUppercut =
      spriteCfg.urls.uppercut !== spriteCfg.urls.punch &&
      spriteCfg.urls.uppercut !== spriteCfg.urls.idle &&
      Boolean(spriteCache.uppercut);
    const prog = f.poseDuration > 0 ? Math.min(1, Math.max(0, 1 - f.poseTimer / f.poseDuration)) : 0;

    let actionSeqKey: ActionSequenceKey | null = null;
    if (f.pose === 'punch') actionSeqKey = 'punch';
    else if (f.pose === 'kick' || f.pose === 'jump_kick') actionSeqKey = 'kick';
    else if (f.pose === 'uppercut') actionSeqKey = 'uppercut';
    else if (f.pose === 'special') actionSeqKey = 'special';
    else if (f.pose === 'sweep') actionSeqKey = 'sweep';

    const actionSeq = actionSeqKey ? FIGHTER_ACTION_FRAMES_CACHE[p.id]?.[actionSeqKey] : undefined;
    const actionFrameIdx =
      actionSeq && actionSeq.length > 0 ? Math.min(actionSeq.length - 1, Math.floor(prog * actionSeq.length)) : -1;
    const activeActionSprite = actionFrameIdx >= 0 && actionSeq ? actionSeq[actionFrameIdx] : null;
    const usingActionFrames = Boolean(activeActionSprite);

    const sprite =
      activeActionSprite ||
      spriteCache[poseKey] ||
      (poseKey === 'fall' ? spriteCache.hit : null) ||
      spriteCache.idle;
    if (sprite) {
      const baseH = isPortrait ? 116 : 124;
      let targetH = baseH;
      const spriteAspect = sprite.width / Math.max(1, sprite.height);
      let targetW = targetH * spriteAspect;

      if (f.pose === 'ko' || f.pose === 'knockdown') {
        if (hasDedicatedFall && poseKey === 'fall') {
          // Dedicated horizontal knocked-out AI sprite anchored flat on the stage floor
          targetW = isPortrait ? 132 : 148;
          targetH = Math.min(82, Math.max(46, targetW * (sprite.height / sprite.width)));
        } else {
          // Fallback rotation only if fallen AI sprite hasn't finished decoding
          ctx.translate(0, -16);
          ctx.rotate(-Math.PI / 2);
          ctx.translate(0, 44);
        }
      } else if (poseKey === 'uppercut') {
        if (p.id === 'kamen_rider') {
          // Calibrated frame-by-frame vertical proportion for Kamen Rider so helmet & torso match idle size
          if (actionFrameIdx === 0 || actionFrameIdx === 1) {
            targetH = Math.round(baseH * 0.94);
          } else if (actionFrameIdx === 2) {
            targetH = Math.round(baseH * 1.06);
          } else if (actionFrameIdx === 5) {
            targetH = baseH;
          } else {
            targetH = Math.round(baseH * 1.13);
          }
        } else {
          targetH = Math.round(baseH * (hasDedicatedUppercut ? 1.32 : 1.12));
        }
        targetW = targetH * spriteAspect;
      } else if (poseKey === 'crouch' && hasDedicatedCrouch) {
        targetH = Math.round(baseH * 0.94);
        targetW = targetH * spriteAspect;
      } else if ((poseKey === 'kick' || poseKey === 'special') && spriteAspect > 1.08) {
        // Normalize horizontal flying kick / wide lunging sprites so head & torso never balloon larger than idle
        const maxWideW = isPortrait ? 128 : 138;
        if (targetW > maxWideW) {
          targetW = maxWideW;
          targetH = Math.round(targetW / spriteAspect);
        }
      }

      let offsetX = 0;
      let offsetY = 0;
      let rot = 0;
      let sx = 1;
      let sy = 1;
      let drawAfterimage = false;

      if (f.pose === 'idle') {
        const breath = Math.sin(time * 0.008);
        sy = 1 + breath * 0.022;
        sx = 1 - breath * 0.012;
        offsetX = Math.sin(time * 0.004) * 1.6;
      } else if (f.pose === 'walk') {
        const strideWave = Math.sin(f.walkPhase);
        offsetY = -Math.abs(strideWave) * 6.5;
        rot = strideWave * 0.055 + 0.04;
        sx = 1 + Math.abs(strideWave) * 0.03;
      } else if (f.pose === 'jump') {
        sy = 1.07;
        sx = 0.94;
        rot = 0.08;
      } else if (f.pose === 'crouch') {
        if (hasDedicatedCrouch) {
          sx = 1.05;
          sy = 0.96;
          offsetY = 3;
        } else {
          sx = 1.08;
          sy = 0.74;
          offsetY = 2;
        }
      } else if (f.pose === 'block') {
        sx = 1.02;
        sy = 0.99;
        offsetX = -2;
      } else if (f.pose === 'sweep') {
        const slide = Math.sin(prog * Math.PI);
        if (usingActionFrames) {
          offsetX = 14 * slide;
          drawAfterimage = slide > 0.4;
        } else {
          sx = 1.14;
          sy = 0.74;
          offsetX = 18 * slide;
          rot = 0.16 * slide;
          drawAfterimage = slide > 0.45;
        }
      } else if (f.pose === 'uppercut') {
        if (usingActionFrames) {
          const rise = Math.sin(prog * Math.PI);
          offsetX = 7 * rise;
          offsetY = actionFrameIdx >= 2 && actionFrameIdx <= 4 ? -6 * rise : 0;
          drawAfterimage = actionFrameIdx === 2 || actionFrameIdx === 3;
        } else if (prog < 0.2) {
          sy = 0.98;
          sx = 1.04;
          offsetY = 1;
          rot = 0.04;
        } else {
          const rise = Math.sin(((prog - 0.2) / 0.8) * Math.PI);
          offsetX = 10 * rise;
          offsetY = -12 * rise;
          rot = -0.1 * rise;
          sy = 1 + 0.03 * rise;
          sx = 1 + 0.02 * rise;
          drawAfterimage = rise > 0.35;
        }
      } else if (f.pose === 'punch') {
        if (usingActionFrames) {
          const snap = Math.sin(prog * Math.PI);
          offsetX = actionFrameIdx >= 2 && actionFrameIdx <= 4 ? 10 * snap : 0;
          drawAfterimage = actionFrameIdx === 3 || actionFrameIdx === 4;
        } else if (prog < 0.22) {
          offsetX = -6;
          rot = -0.06;
        } else {
          const snap = Math.sin(((prog - 0.22) / 0.78) * Math.PI);
          offsetX = 17 * snap;
          sx = 1 + 0.06 * snap;
          drawAfterimage = snap > 0.4;
        }
      } else if (f.pose === 'special') {
        const burst = Math.sin(prog * Math.PI);
        offsetX = usingActionFrames ? 12 * burst : 14 * burst;
        sx = usingActionFrames ? 1 : 1 + 0.05 * burst;
        drawAfterimage = burst > 0.3;
      } else if (f.pose === 'kick' || f.pose === 'jump_kick') {
        if (usingActionFrames) {
          const snap = Math.sin(prog * Math.PI);
          offsetX = actionFrameIdx >= 2 && actionFrameIdx <= 3 ? 11 * snap : 0;
          offsetY = actionFrameIdx === 3 ? -12 * snap : 0;
          drawAfterimage = actionFrameIdx === 3;
        } else if (prog < 0.18) {
          offsetX = -4;
          sy = 0.95;
        } else {
          const snap = Math.sin(((prog - 0.18) / 0.82) * Math.PI);
          offsetX = 16 * snap;
          offsetY = (p.id === 'kamen_rider' || p.id === 'bisop' || p.id === 'queen' ? -12 : -5) * snap;
          rot = -0.06 * snap;
          drawAfterimage = snap > 0.35;
        }
      } else if (f.pose === 'hit') {
        rot = hasDedicatedHit ? -0.08 : -0.24;
        offsetX = -10;
        sy = 0.98;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
      } else if (f.pose === 'knockdown' || f.pose === 'ko') {
        if (hasDedicatedFall && f.y < GROUND_Y - 10) {
          // Slight tumble angle while launched in mid-air before hitting the stage floor
          rot = -0.18 * Math.min(1, (GROUND_Y - f.y) / 90);
        }
        offsetY = 3;
      } else if (f.pose === 'dizzy') {
        rot = Math.sin(time * 0.016) * 0.14;
        offsetX = Math.sin(time * 0.012) * 5;
      } else if (f.pose === 'victory') {
        const pulse = Math.sin(time * 0.01) * 0.025;
        sy = 1.03 + pulse;
        ctx.shadowColor = p.primaryLight;
        ctx.shadowBlur = 18;
      }

      const drawAnchorX = f.pose === 'ko' || f.pose === 'knockdown' ? -targetW * 0.5 : -targetW * 0.45;

      // Motion ghost afterimage for high-speed sprite strikes
      if (drawAfterimage && !isPortrait) {
        ctx.save();
        ctx.globalAlpha = 0.26;
        ctx.translate(offsetX - 18, offsetY);
        ctx.rotate(rot * 0.7);
        ctx.scale(sx, sy);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(sprite, drawAnchorX, -targetH, targetW, targetH);
        ctx.restore();
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.rotate(rot);
      ctx.scale(sx, sy);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(sprite, drawAnchorX, -targetH, targetW, targetH);
      ctx.restore();

      // Dynamic combat VFX overlays matched to each pose
      if (f.pose === 'uppercut') {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(36, -112, 34, -Math.PI * 0.78, Math.PI * 0.14);
        ctx.stroke();
      } else if (f.pose === 'hit' && !isPortrait) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(4, -74, 22, 0, Math.PI * 2);
        ctx.stroke();
      } else if (f.pose === 'punch' || f.pose === 'kick' || f.pose === 'jump_kick') {
        ctx.strokeStyle = 'rgba(255,255,255,0.72)';
        ctx.lineWidth = 3;
        const tx = f.pose === 'punch' ? 56 : 64;
        const ty = f.pose === 'punch' ? -84 : -76;
        ctx.beginPath();
        ctx.moveTo(tx - 28, ty);
        ctx.lineTo(tx + 8, ty);
        ctx.stroke();
      } else if (f.pose === 'sweep') {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.78)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(28, -14, 34, -0.35, 0.55);
        ctx.stroke();
      } else if (f.pose === 'block') {
        ctx.strokeStyle = hasDedicatedBlock ? 'rgba(56, 189, 248, 0.42)' : 'rgba(56, 189, 248, 0.9)';
        ctx.lineWidth = hasDedicatedBlock ? 2.2 : 3.5;
        ctx.beginPath();
        ctx.arc(30, -68, 38, -0.8, 0.8);
        ctx.stroke();
      } else if (f.pose === 'dizzy' && !isPortrait) {
        for (let i = 0; i < 3; i++) {
          const a = time * 0.008 + (i * Math.PI * 2) / 3;
          const sxPos = Math.cos(a) * 20;
          const syPos = -132 + Math.sin(a) * 6;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(sxPos, syPos, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (f.isLocalPlayer && !isPortrait) {
        ctx.save();
        ctx.scale(f.facing, 1);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '900 10px monospace';
        ctx.textAlign = 'center';
        const tagY = f.pose === 'ko' || f.pose === 'knockdown' ? -targetH - 12 : poseKey === 'uppercut' ? -targetH - 8 : -134;
        ctx.fillText('▼ KAMU', 0, tagY);
        ctx.restore();
      }

      ctx.restore();
      return;
    }
  }

  // KO / Knockdown horizontal rotation (vector fallback fighters)
  if (f.pose === 'ko' || f.pose === 'knockdown') {
    ctx.translate(0, -16);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, 44);
  }

  const bob =
    f.pose === 'idle'
      ? Math.sin(time * 0.008) * 2.5
      : f.pose === 'dizzy'
      ? Math.sin(time * 0.015) * 4
      : 0;
  const sway = f.pose === 'dizzy' ? Math.sin(time * 0.012) * 8 : 0;

  let torsoY = -74 + bob;
  let torsoLean = 0.08;
  if (f.pose === 'crouch' || f.pose === 'sweep') {
    torsoY = -46;
    torsoLean = 0.24;
  } else if (f.pose === 'hit') {
    torsoLean = -0.32;
    torsoY = -70;
  } else if (f.pose === 'uppercut') {
    torsoLean = -0.14;
    torsoY = -82;
  } else if (f.pose === 'kick') {
    torsoLean = -0.26;
  } else if (f.pose === 'victory') {
    torsoLean = 0;
    torsoY = -76;
  }

  const stride = f.pose === 'walk' ? Math.sin(f.walkPhase) * 19 : 0;

  // Helper to draw boot/foot
  const drawBoot = (fx: number, fy: number, angle = 0) => {
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(angle);
    ctx.fillStyle = p.id === 'shaolin' ? '#f8fafc' : p.suitDark;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.quadraticCurveTo(8, -8, 14, -2);
    ctx.quadraticCurveTo(16, 4, 12, 6);
    ctx.quadraticCurveTo(0, 8, -7, 6);
    ctx.quadraticCurveTo(-9, 0, -6, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = p.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 4);
    ctx.quadraticCurveTo(4, 6, 11, 4);
    ctx.stroke();
    ctx.restore();
  };

  // Helper to draw clenched fist with wrist wrap / gauntlet
  const drawFist = (hx: number, hy: number, colorOverride?: string) => {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.fillStyle = p.id === 'shaolin' ? '#18181b' : p.primary;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-2, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colorOverride || (p.id === 'shaolin' || p.id === 'raiden' || p.id === 'shao' ? p.skin : '#18181b');
    ctx.beginPath();
    ctx.arc(4, -1, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  // === FLOWING ROYAL CAPE (Shao Trojan) ===
  if (p.hasCape) {
    const wave = Math.sin(time * 0.008) * 6;
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sway - 12, torsoY + 2);
    ctx.quadraticCurveTo(sway - 38 + wave, torsoY + 34, sway - 32 + wave, -4);
    ctx.lineTo(sway - 12, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // === BACK LEG ===
  let bKneeX = -15 - stride * 0.6;
  let bKneeY = -34;
  let bFootX = -24 - stride;
  let bFootY = -5;

  if (f.pose === 'crouch' || f.pose === 'sweep') {
    bKneeX = -18;
    bKneeY = -22;
    bFootX = -24;
    bFootY = -5;
  } else if (f.pose === 'jump' || f.pose === 'jump_kick') {
    bKneeX = -18;
    bKneeY = -30;
    bFootX = -25;
    bFootY = -12;
  }

  drawTaperedMuscle(ctx, sway - 7, torsoY + 36, bKneeX, bKneeY, 9.5, 7, p.pants, '#27272a', '#09090b');
  drawTaperedMuscle(ctx, bKneeX, bKneeY, bFootX, bFootY, 7, 5.2, p.pants, '#27272a', '#09090b');
  drawBoot(bFootX, bFootY);

  // === BACK ARM ===
  let bElbowX = sway - 16;
  let bElbowY = torsoY + 18;
  let bHandX = sway + 7;
  let bHandY = torsoY + 8;

  if (f.pose === 'block') {
    bElbowX = sway + 8;
    bElbowY = torsoY + 12;
    bHandX = sway + 14;
    bHandY = torsoY - 14;
  } else if (f.pose === 'special') {
    bElbowX = sway + 12;
    bElbowY = torsoY + 12;
    bHandX = sway + 36;
    bHandY = torsoY + 6;
  } else if (f.pose === 'victory') {
    bElbowX = sway - 18;
    bElbowY = torsoY + 14;
    bHandX = sway - 22;
    bHandY = torsoY + 28;
  }

  const armBase = p.bareChest || p.id === 'scorpio' || p.id === 'subbyte' || p.id === 'crimson' || p.id === 'reptile' ? p.skin : p.suitDark;
  const armHi = p.bareChest || p.hairOrHat === 'ninja_hood' ? p.skinHighlight : '#ffffff';
  const armSh = p.bareChest || p.hairOrHat === 'ninja_hood' ? p.skinShadow : '#94a3b8';

  drawTaperedMuscle(ctx, sway - 8, torsoY + 5, bElbowX, bElbowY, 7, 5.5, armBase, armHi, armSh);
  drawTaperedMuscle(ctx, bElbowX, bElbowY, bHandX, bHandY, 5.5, 4.5, armBase, armHi, armSh);
  drawFist(bHandX, bHandY);

  // === FRONT LEG (With Shaolin red stripe / Ninja shin guard) ===
  let fKneeX = 16 + stride * 0.6;
  let fKneeY = -34;
  let fFootX = 22 + stride;
  let fFootY = -5;
  let fFootAngle = 0;

  if (f.pose === 'crouch') {
    fKneeX = 20;
    fKneeY = -20;
    fFootX = 18;
    fFootY = -5;
  } else if (f.pose === 'sweep') {
    fKneeX = 40;
    fKneeY = -12;
    fFootX = 72;
    fFootY = -5;
  } else if (f.pose === 'kick') {
    fKneeX = 32;
    fKneeY = torsoY + 8;
    fFootX = 72;
    fFootY = torsoY - 4;
    fFootAngle = -0.3;
  } else if (f.pose === 'jump') {
    fKneeX = 18;
    fKneeY = -36;
    fFootX = 12;
    fFootY = -16;
  } else if (f.pose === 'jump_kick') {
    fKneeX = 34;
    fKneeY = torsoY + 20;
    fFootX = 70;
    fFootY = torsoY + 16;
    fFootAngle = 0.2;
  }

  drawTaperedMuscle(ctx, sway + 7, torsoY + 36, fKneeX, fKneeY, 10, 7.2, p.pants, '#27272a', '#09090b');
  drawTaperedMuscle(ctx, fKneeX, fKneeY, fFootX, fFootY, 7.2, 5.5, p.pants, '#27272a', '#09090b');

  // Liu Kang's iconic red side-stripe on pants
  if (p.id === 'shaolin') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sway + 9, torsoY + 36);
    ctx.lineTo(fKneeX + 2, fKneeY);
    ctx.lineTo(fFootX + 2, fFootY - 6);
    ctx.stroke();
  } else if (p.hairOrHat === 'ninja_hood') {
    // Ninja shin guard strap lines
    ctx.strokeStyle = p.primary;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo((fKneeX + fFootX) * 0.5 - 4, (fKneeY + fFootY) * 0.5);
    ctx.lineTo((fKneeX + fFootX) * 0.5 + 5, (fKneeY + fFootY) * 0.5);
    ctx.stroke();
  }
  drawBoot(fFootX, fFootY, fFootAngle);

  // === SCULPTED TORSO & COSTUME ===
  ctx.save();
  ctx.translate(sway, torsoY);
  ctx.rotate(torsoLean);

  // Broad heroic V-taper torso polygon
  const tGrad = ctx.createLinearGradient(-18, 0, 18, 0);
  if (p.bareChest) {
    tGrad.addColorStop(0, p.skinShadow);
    tGrad.addColorStop(0.55, p.skinHighlight);
    tGrad.addColorStop(1, p.skin);
  } else {
    tGrad.addColorStop(0, '#09090b');
    tGrad.addColorStop(0.5, p.suitDark);
    tGrad.addColorStop(1, '#18181b');
  }

  ctx.fillStyle = tGrad;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.quadraticCurveTo(-23, 14, -13, 38);
  ctx.quadraticCurveTo(0, 42, 13, 38);
  ctx.quadraticCurveTo(23, 14, 18, -2);
  ctx.quadraticCurveTo(0, -6, -18, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (p.bareChest) {
    // Pectoral & 6-pack abs sculpting (Liu Kang & Shao Kahn)
    ctx.strokeStyle = p.skinShadow;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-13, 12);
    ctx.quadraticCurveTo(-5, 16, 0, 13);
    ctx.quadraticCurveTo(6, 16, 13, 12);
    ctx.moveTo(0, 13);
    ctx.lineTo(0, 32);
    // Ab lines
    ctx.moveTo(-6, 20);
    ctx.lineTo(6, 20);
    ctx.moveTo(-5, 26);
    ctx.lineTo(5, 26);
    ctx.stroke();

    if (p.id === 'shao') {
      // Shao Kahn spiked shoulder pauldrons & X-harness with skull emblem
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-15, 2);
      ctx.lineTo(13, 34);
      ctx.moveTo(15, 2);
      ctx.lineTo(-13, 34);
      ctx.stroke();

      // Gold chest medallion
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spiked Shoulder Armor
      [-18, 18].forEach((sx) => {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(sx, 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Silver spike
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(sx - 3, -6);
        ctx.lineTo(sx, -16);
        ctx.lineTo(sx + 3, -6);
        ctx.closePath();
        ctx.fill();
      });
    }
  } else {
    // Classic MK2 / UMK3 V-Vest + Quilted Shoulder Flaps (Ninjas & Raiden)
    const vGrad = ctx.createLinearGradient(-16, 0, 16, 36);
    vGrad.addColorStop(0, p.primaryLight);
    vGrad.addColorStop(0.5, p.primary);
    vGrad.addColorStop(1, p.secondary);

    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.quadraticCurveTo(-8, -4, 0, 26);
    ctx.quadraticCurveTo(8, -4, 20, -2);
    ctx.quadraticCurveTo(15, 36, 0, 38);
    ctx.quadraticCurveTo(-15, 36, -20, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Quilted MK diagonal lines on vest
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(-6, 18);
    ctx.moveTo(16, 8);
    ctx.lineTo(6, 18);
    ctx.moveTo(-14, 18);
    ctx.lineTo(-4, 28);
    ctx.moveTo(14, 18);
    ctx.lineTo(4, 28);
    ctx.stroke();
  }

  // Waist Sash + MK Loincloth Tabard
  ctx.fillStyle = p.id === 'shaolin' ? '#dc2626' : p.secondary;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.fillRect(-14, 34, 28, 6);
  ctx.strokeRect(-14, 34, 28, 6);

  if (p.hairOrHat === 'ninja_hood' || p.id === 'raiden' || p.id === 'shao') {
    ctx.fillStyle = p.primary;
    ctx.beginPath();
    ctx.moveTo(-7, 40);
    ctx.lineTo(8, 40);
    ctx.lineTo(6, 58);
    ctx.lineTo(-6, 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Gold/light trim on loincloth
    ctx.strokeStyle = p.primaryLight;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-4, 42, 9, 13);
  } else if (p.id === 'shaolin') {
    // Fluttering red belt tie
    const wave = Math.sin(time * 0.012) * 3;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(6, 39);
    ctx.lineTo(14 + wave, 56);
    ctx.lineTo(8 + wave, 57);
    ctx.closePath();
    ctx.fill();
  }

  // === Red Ranger White Diamond Chest Emblem & Kamen Rider Scarf / Belt ===
  if (p.hairOrHat === 'ranger_helmet') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(9, 23);
    ctx.lineTo(0, 34);
    ctx.lineTo(-9, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (p.hairOrHat === 'kamen_helmet') {
    // Fluttering red scarf around neck
    const scarfWave = Math.sin(time * 0.02) * 6;
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.quadraticCurveTo(-26 - scarfWave, 10, -32 - scarfWave, 24);
    ctx.lineTo(-24 - scarfWave, 28);
    ctx.quadraticCurveTo(-18, 14, -6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Typhoon belt buckle
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 36, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // === HEAD, MASK, HAIR, OR HELM ===
  ctx.save();
  ctx.translate(2, -14);

  // Muscular Neck
  ctx.fillStyle = p.skinShadow;
  ctx.fillRect(-5.5, 4, 11, 11);

  // Realistic Sculpted Human Head
  const hGrad = ctx.createRadialGradient(3, -5, 2, 0, -4, 14);
  hGrad.addColorStop(0, p.skinHighlight);
  hGrad.addColorStop(0.7, p.skin);
  hGrad.addColorStop(1, p.skinShadow);
  ctx.fillStyle = hGrad;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-9, -15);
  ctx.quadraticCurveTo(0, -22, 9, -15);
  ctx.quadraticCurveTo(13, -4, 10, 6);
  ctx.quadraticCurveTo(4, 13, 0, 13);
  ctx.quadraticCurveTo(-4, 13, -10, 6);
  ctx.quadraticCurveTo(-13, -4, -9, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (p.hairOrHat === 'ninja_hood') {
    // Ninja Cowl Hood wrapping forehead & sides
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(-12, -1);
    ctx.quadraticCurveTo(-13, -20, 0, -20);
    ctx.quadraticCurveTo(13, -19, 12, -5);
    ctx.lineTo(4, -8);
    ctx.lineTo(-8, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ribbed MK Ninja Face Mask
    const mGrad = ctx.createLinearGradient(-10, 0, 12, 10);
    mGrad.addColorStop(0, p.secondary);
    mGrad.addColorStop(0.5, p.primary);
    mGrad.addColorStop(1, p.primaryLight);
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.moveTo(-11, -1);
    ctx.lineTo(12, -2);
    ctx.lineTo(10, 9);
    ctx.lineTo(4, 12);
    ctx.lineTo(-9, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mask breathing ribs
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(2, 1);
    ctx.lineTo(10, 1);
    ctx.moveTo(2, 5);
    ctx.lineTo(9, 5);
    ctx.stroke();

    // Sub-Zero eye scar!
    if (p.hasScar) {
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(4, -9);
      ctx.lineTo(7, -1);
      ctx.stroke();
    }

    // Fierce brow & eyes
    ctx.fillStyle = p.eyeGlow || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(2, -5);
    ctx.lineTo(9, -6);
    ctx.lineTo(8, -3);
    ctx.lineTo(2, -3);
    ctx.closePath();
    ctx.fill();
  } else if (p.hairOrHat === 'shaolin_hair') {
    // Liu Kang sweeping martial arts black hair + crimson headband
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(-15, -21, 1, -20);
    ctx.quadraticCurveTo(13, -19, 12, -10);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();
    // Hair mullet/back hair
    ctx.beginPath();
    ctx.moveTo(-11, -6);
    ctx.lineTo(-15, 6);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();

    // Crimson Headband + fluttering tails
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12, -11, 24, 5);
    ctx.strokeRect(-12, -11, 24, 5);
    const wave = Math.sin(time * 0.018) * 4;
    ctx.beginPath();
    ctx.moveTo(-12, -9);
    ctx.lineTo(-29, -12 + wave);
    ctx.lineTo(-27, -6 + wave);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fierce brow & eye + subtle mouth line
    ctx.fillStyle = '#09090b';
    ctx.fillRect(3, -5, 6, 2.5);
    ctx.strokeStyle = p.skinShadow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, 5);
    ctx.lineTo(9, 5);
    ctx.stroke();
  } else if (p.hairOrHat === 'raiden_hat') {
    // Black cowl + glowing blue electric eyes + Iconic Conical Straw Hat!
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.quadraticCurveTo(-12, -18, 0, -18);
    ctx.quadraticCurveTo(12, -18, 11, 2);
    ctx.lineTo(8, 10);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();

    // Exposed nose/mouth/chin
    ctx.fillStyle = p.skin;
    ctx.fillRect(-2, -1, 12, 10);

    // Glowing electric eyes
    ctx.fillStyle = '#60a5fa';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.fillRect(3, -5, 6, 3);
    ctx.shadowBlur = 0;

    // Wide Woven Bamboo Coolie Hat
    const hatGrad = ctx.createLinearGradient(0, -28, 0, -8);
    hatGrad.addColorStop(0, '#fde68a');
    hatGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = hatGrad;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-29, -8);
    ctx.quadraticCurveTo(0, -29, 0, -28);
    ctx.quadraticCurveTo(0, -29, 29, -8);
    ctx.quadraticCurveTo(0, -4, -29, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (p.hairOrHat === 'shao_helm') {
    // Shao Kahn Bone/Gold Skull Warlord Helmet with curved horns!
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, -6, 14, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    ctx.stroke();

    // Sculpted Bone/Gold Skull Mask
    const helmGrad = ctx.createLinearGradient(-10, -12, 12, 8);
    helmGrad.addColorStop(0, '#fef3c7');
    helmGrad.addColorStop(0.5, '#d97706');
    helmGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = helmGrad;
    ctx.beginPath();
    ctx.moveTo(-9, -13);
    ctx.lineTo(12, -13);
    ctx.lineTo(13, 3);
    ctx.lineTo(4, 5);
    ctx.lineTo(-9, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved Warlord Horns
    ctx.fillStyle = '#f3f4f6';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(side * 10, -12);
      ctx.quadraticCurveTo(side * 22, -20, side * 19, -31);
      ctx.quadraticCurveTo(side * 14, -20, side * 5, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Glowing Crimson Eyes
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(3, -6, 6, 3);
    ctx.shadowBlur = 0;
  } else if (p.hairOrHat === 'ranger_helmet') {
    // Ultra-HD Red Ranger Helmet with polished metallic gradient, silver T-visor, and gold T-Rex crown crest with gem
    const rHelmetGrad = ctx.createLinearGradient(-11, -19, 11, 11);
    rHelmetGrad.addColorStop(0, '#f87171');
    rHelmetGrad.addColorStop(0.5, '#dc2626');
    rHelmetGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = rHelmetGrad;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.quadraticCurveTo(-13, -19, 0, -19);
    ctx.quadraticCurveTo(13, -19, 11, 2);
    ctx.lineTo(6, 11);
    ctx.lineTo(-6, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Specular highlight arc on helmet
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -5, 8, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Silver T-Visor with inner cyan glow
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(1, -6, 9, 6);
    ctx.strokeRect(1, -6, 9, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(3, -4, 5, 2.5);

    // Golden T-Rex Crown Crest on top with embedded ruby gem
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -17);
    ctx.lineTo(0, -24);
    ctx.lineTo(5, -17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -19, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.hairOrHat === 'kamen_helmet') {
    // Ultra-HD Kamen Rider Armor Helmet with dark titanium finish
    const kHelmetGrad = ctx.createLinearGradient(-11, -20, 11, 11);
    kHelmetGrad.addColorStop(0, '#334155');
    kHelmetGrad.addColorStop(0.5, '#0f172a');
    kHelmetGrad.addColorStop(1, '#020617');
    ctx.fillStyle = kHelmetGrad;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.quadraticCurveTo(-13, -20, 0, -20);
    ctx.quadraticCurveTo(13, -20, 11, 2);
    ctx.lineTo(6, 11);
    ctx.lineTo(-6, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Green Compound Bug Eyes with hexagonal crystal grid
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(6, -4, 6, 4.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Eye specular shine
    ctx.fillStyle = '#dcfce7';
    ctx.beginPath();
    ctx.ellipse(7.5, -5.5, 2, 1.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Silver Dual Antennae with glowing tips
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -18);
    ctx.lineTo(11, -29);
    ctx.moveTo(-2, -18);
    ctx.lineTo(-8, -28);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(11, -29, 2, 0, Math.PI * 2);
    ctx.arc(-8, -28, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // end head
  ctx.restore(); // end torso

  // === FRONT ARM (Over torso for crisp combat silhouettes!) ===
  let fElbowX = sway + 9;
  let fElbowY = torsoY + 19;
  let fHandX = sway + 22;
  let fHandY = torsoY + 6;

  if (f.pose === 'punch') {
    fElbowX = sway + 30;
    fElbowY = torsoY + 5;
    fHandX = sway + 66;
    fHandY = torsoY + 2;
  } else if (f.pose === 'uppercut') {
    fElbowX = sway + 21;
    fElbowY = torsoY - 14;
    fHandX = sway + 36;
    fHandY = torsoY - 50;
  } else if (f.pose === 'block') {
    fElbowX = sway + 17;
    fElbowY = torsoY + 14;
    fHandX = sway + 19;
    fHandY = torsoY - 10;
  } else if (f.pose === 'special') {
    fElbowX = sway + 24;
    fElbowY = torsoY + 8;
    fHandX = sway + 46;
    fHandY = torsoY + 4;
  } else if (f.pose === 'victory') {
    if (p.id === 'subbyte') {
      fElbowX = sway + 14;
      fElbowY = torsoY + 6;
      fHandX = sway + 22;
      fHandY = torsoY - 26;
    } else if (p.id === 'shaolin') {
      fElbowX = sway + 16;
      fElbowY = torsoY + 4;
      fHandX = sway + 8;
      fHandY = torsoY - 12;
    } else if (p.id === 'raiden') {
      fElbowX = sway + 18;
      fElbowY = torsoY - 18;
      fHandX = sway + 10;
      fHandY = torsoY - 48;
    } else if (p.id === 'red_ranger') {
      fElbowX = sway + 18;
      fElbowY = torsoY + 8;
      fHandX = sway + 34;
      fHandY = torsoY - 16;
    } else if (p.id === 'crimson') {
      fElbowX = sway + 18;
      fElbowY = torsoY + 4;
      fHandX = sway + 28;
      fHandY = torsoY - 22;
    } else if (p.id === 'reptile') {
      fElbowX = sway + 20;
      fElbowY = torsoY + 12;
      fHandX = sway + 32;
      fHandY = torsoY - 8;
    } else {
      fElbowX = sway + 16;
      fElbowY = torsoY - 12;
      fHandX = sway + 18;
      fHandY = torsoY - 44;
    }
  } else if (f.pose === 'hit') {
    fElbowX = sway - 12;
    fElbowY = torsoY + 20;
    fHandX = sway - 18;
    fHandY = torsoY + 6;
  }

  drawTaperedMuscle(ctx, sway + 5, torsoY + 7, fElbowX, fElbowY, 7.5, 5.8, armBase, armHi, armSh);
  drawTaperedMuscle(ctx, fElbowX, fElbowY, fHandX, fHandY, 5.8, 4.8, armBase, armHi, armSh);
  drawFist(fHandX, fHandY);

  // Per-character vector victory emblem props
  if (f.pose === 'victory' && p.id === 'subbyte') {
    ctx.fillStyle = '#7dd3fc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(fHandX, fHandY - 16);
    ctx.lineTo(fHandX + 7, fHandY - 6);
    ctx.lineTo(fHandX, fHandY + 4);
    ctx.lineTo(fHandX - 7, fHandY - 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (f.pose === 'victory' && p.id === 'raiden') {
    ctx.fillStyle = '#e0f2fe';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(fHandX, fHandY - 12, 9 + Math.sin(time * 0.02) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === SHAO TROJAN WRATH HAMMER IN VICTORY / HEAVY SWING ===
  if (p.id === 'shao' && (f.pose === 'uppercut' || f.pose === 'victory')) {
    ctx.save();
    ctx.translate(fHandX, fHandY);
    ctx.rotate(f.pose === 'uppercut' ? 0.5 : -0.2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -38, 6, 48);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.fillRect(-15, -54, 30, 18);
    ctx.strokeRect(-15, -54, 30, 18);
    ctx.restore();
  }

  // === ELECTRICITY SPARKS ON RAIDEN'S FIST ===
  if (p.id === 'raiden' && !isPortrait && Math.sin(time * 0.04) > 0.2) {
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fHandX - 6, fHandY - 6);
    ctx.lineTo(fHandX + 5, fHandY - 13);
    ctx.lineTo(fHandX + 10, fHandY + 2);
    ctx.stroke();
  }

  // === COMBAT SLASH & BLOCK SHIELD FX ===
  if (f.pose === 'uppercut') {
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(fHandX - 6, fHandY + 24, 28, -Math.PI * 0.6, Math.PI * 0.12);
    ctx.stroke();
  } else if (f.pose === 'punch' || f.pose === 'kick' || f.pose === 'jump_kick') {
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 3;
    const tx = f.pose === 'punch' ? fHandX : fFootX;
    const ty = f.pose === 'punch' ? fHandY : fFootY;
    ctx.beginPath();
    ctx.moveTo(tx - 26, ty);
    ctx.lineTo(tx + 5, ty);
    ctx.stroke();
  } else if (f.pose === 'block') {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sway + 22, torsoY + 8, 32, -0.9, 0.9);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw authentic SNES Mortal Kombat Arena Background (9 AI-Generated Arenas + Vector Fallback)
function drawArenaBackground(ctx: CanvasRenderingContext2D, stage: StageId, time: number, fatalityDarkness: number) {
  ensureArenaBackgroundsLoaded();
  const cachedBg = ARENA_BG_CACHE[stage];

  if (cachedBg) {
    // 1:1 hardware canvas blit (<0.2ms/frame)
    ctx.drawImage(cachedBg, 0, 0);

    // Subtle live ambient glow pulse matched to each of the 9 arena themes
    ctx.save();
    const pulse = 0.08 + Math.sin(time * 0.012) * 0.04;
    if (stage === 1) {
      [158, 642].forEach((tx) => {
        const glow = ctx.createRadialGradient(tx, 272, 4, tx, 272, 68);
        glow.addColorStop(0, `rgba(251, 146, 60, ${pulse * 1.9})`);
        glow.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(tx, 272, 68, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (stage === 2) {
      [52, 748].forEach((tx) => {
        const glow = ctx.createRadialGradient(tx, 215, 4, tx, 215, 64);
        glow.addColorStop(0, `rgba(16, 185, 129, ${pulse * 1.8})`);
        glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(tx, 215, 64, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (stage === 3) {
      [62, 738].forEach((tx) => {
        const glow = ctx.createRadialGradient(tx, 210, 4, tx, 210, 72);
        glow.addColorStop(0, `rgba(245, 158, 11, ${pulse * 2.0})`);
        glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(tx, 210, 72, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (stage === 4) {
      // Lab Server Siber: Subtle pulsing cyan data columns
      const scanY = (time * 0.06) % STAGE_H;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(0, scanY, STAGE_W, 4);
    } else if (stage === 5) {
      // Kawah Lava: Magma glow rising from below
      const magma = ctx.createLinearGradient(0, GROUND_Y - 40, 0, STAGE_H);
      magma.addColorStop(0, 'rgba(239, 68, 68, 0)');
      magma.addColorStop(1, `rgba(249, 115, 22, ${pulse * 2.2})`);
      ctx.fillStyle = magma;
      ctx.fillRect(0, GROUND_Y - 40, STAGE_W, STAGE_H - GROUND_Y + 40);
    } else if (stage === 6) {
      // Kuil Salju: Gentle drifting snowflakes
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      for (let i = 0; i < 14; i++) {
        const sx = (i * 63 + time * 0.025) % STAGE_W;
        const sy = (i * 41 + time * 0.04) % GROUND_Y;
        ctx.fillRect(sx, sy, 2.5, 2.5);
      }
    } else if (stage === 7) {
      // Rawa Beracun: Rising green acid mist glow
      const acid = ctx.createLinearGradient(0, GROUND_Y - 30, 0, STAGE_H);
      acid.addColorStop(0, 'rgba(34, 197, 94, 0)');
      acid.addColorStop(1, `rgba(34, 197, 94, ${pulse * 1.9})`);
      ctx.fillStyle = acid;
      ctx.fillRect(0, GROUND_Y - 30, STAGE_W, STAGE_H - GROUND_Y + 30);
    } else if (stage === 8) {
      // Puncak Halilintar: Occasional distant sky lightning flash
      if (Math.sin(time * 0.009) > 0.93) {
        ctx.fillStyle = 'rgba(147, 197, 253, 0.16)';
        ctx.fillRect(0, 0, STAGE_W, GROUND_Y);
      }
    } else if (stage === 9) {
      // Gerbang Kuantum: Central cosmic portal pulse
      const qGlow = ctx.createRadialGradient(400, 200, 12, 400, 200, 130);
      qGlow.addColorStop(0, `rgba(192, 132, 252, ${pulse * 2.1})`);
      qGlow.addColorStop(1, 'rgba(192, 132, 252, 0)');
      ctx.fillStyle = qGlow;
      ctx.beginPath();
      ctx.arc(400, 200, 130, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle horizon floor anchor line at GROUND_Y
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(STAGE_W, GROUND_Y);
    ctx.stroke();
    ctx.restore();
  } else {
    // Crisp atmospheric vector fallback while AI stage decodes
    const stagePalettes: Record<StageId, [string, string, string]> = {
      1: ['#070b1e', '#171c3a', '#2d1e38'],
      2: ['#041219', '#0b2936', '#123d33'],
      3: ['#1a0408', '#3b0912', '#581217'],
      4: ['#020617', '#082f49', '#0f172a'],
      5: ['#1c0402', '#450a0a', '#7c2d12'],
      6: ['#082f49', '#0c4a6e', '#164e63'],
      7: ['#052e16', '#14532d', '#1a2e05'],
      8: ['#0f172a', '#1e1b4b', '#312e81'],
      9: ['#090418', '#3b0764', '#581c87'],
    };
    const pal = stagePalettes[stage] || stagePalettes[1];
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, pal[0]);
    sky.addColorStop(0.55, pal[1]);
    sky.addColorStop(1, pal[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, STAGE_W, GROUND_Y);

    const floorGrad = ctx.createLinearGradient(0, GROUND_Y, 0, STAGE_H);
    floorGrad.addColorStop(0, pal[2]);
    floorGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GROUND_Y, STAGE_W, STAGE_H - GROUND_Y);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(STAGE_W, GROUND_Y);
    ctx.stroke();
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(STAGE_W / 2 + i * 70, GROUND_Y);
      ctx.lineTo(STAGE_W / 2 + i * 115, STAGE_H);
      ctx.stroke();
    }
  }

  if (fatalityDarkness > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.85, fatalityDarkness)})`;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  }
}

// Character-Specific Projectile Renderer (Kunai Spear, Ice Ball, Fire Dragon, Lightning Bolt)
function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile, time: number) {
  ctx.save();
  const dir = proj.vx >= 0 ? 1 : -1;

  if (proj.type === 'spear') {
    // Scorpion's Iconic Kunai + Rope/Chain!
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(proj.originX, proj.y);
    ctx.lineTo(proj.x, proj.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.translate(proj.x, proj.y);
    ctx.scale(dir, 1);
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-4, -7);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-4, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (proj.type === 'ice') {
    // Rotating faceted ice crystal sphere
    ctx.translate(proj.x, proj.y);
    ctx.rotate(time * 0.015);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const r = i % 2 === 0 ? 15 : 10;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === 'dragon') {
    // Flaming Dragon Fireball
    ctx.translate(proj.x, proj.y);
    ctx.scale(dir, 1);
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(4, -12);
    ctx.lineTo(-20, -6);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-20, 8);
    ctx.lineTo(4, 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(4, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === 'lightning') {
    // Jagged crackling electric bolt
    ctx.translate(proj.x, proj.y);
    ctx.scale(dir, 1);
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-24, -4);
    ctx.lineTo(-8, 5);
    ctx.lineTo(4, -7);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(16, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Plasma / Acid / Emperor Spear
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = proj.core;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Portrait Preview Component: 'bust' = KTP-style close-up portrait, 'front' = Full-body Front Pose
function FighterPortrait({
  id,
  active,
  variant = 'bust',
}: {
  id: FighterId;
  active: boolean;
  variant?: 'bust' | 'front';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const w = variant === 'front' ? 170 : 140;
  const h = variant === 'front' ? 190 : 140;

  useEffect(() => {
    ensureFighterSpritesLoaded();
    if (active) prioritizeFighterSprites(id);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const prof = FIGHTERS[id];

      // KTP / MK Select Screen backdrop tint matched to character theme
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 8, w * 0.5, h * 0.5, w * 0.6);
      bg.addColorStop(0, active ? `${prof.primary}66` : 'rgba(30, 41, 59, 0.55)');
      bg.addColorStop(1, 'rgba(2, 6, 23, 0.15)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const spriteCache = FIGHTER_SPRITE_CACHE[id];
      const frontSprite = spriteCache ? spriteCache.victory || spriteCache.idle : null;

      if (frontSprite) {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        if (variant === 'bust') {
          // KTP-style close-up headshot & upper chest framing
          const cropH = Math.max(1, frontSprite.height * 0.46);
          const cropW = Math.min(frontSprite.width, cropH * (w / h));
          const sxPos = Math.max(0, (frontSprite.width - cropW) * 0.5);
          ctx.drawImage(frontSprite, sxPos, 0, cropW, cropH, 6, 4, w - 12, h - 4);
        } else {
          // Full-body front heroic spotlight pose with character victory aura
          ctx.save();
          ctx.translate(w * 0.5, h - 14);
          drawVictoryAura(ctx, id, t, true);
          ctx.restore();

          const pulse = 1 + Math.sin(t * 0.008) * 0.02;
          const targetH = 158 * pulse;
          const targetW = targetH * (frontSprite.width / frontSprite.height);
          ctx.shadowColor = prof.primaryLight;
          ctx.shadowBlur = 14;
          ctx.drawImage(frontSprite, (w - targetW) * 0.5, h - 10 - targetH, targetW, targetH);
        }
        ctx.restore();
      } else {
        drawFrontVectorFighter(ctx, prof, t, variant);
      }

      if (variant === 'bust') {
        // Subtle KTP inner photo frame border
        ctx.strokeStyle = active ? 'rgba(251, 191, 36, 0.55)' : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, w - 4, h - 4);
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [id, active, variant, w, h]);

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      className={cn('mx-auto block', variant === 'front' ? 'w-36 h-40' : 'w-24 h-24 rounded-lg bg-slate-950/90')}
    />
  );
}

export default function FightingGame({ currentStudent, isAdmin, onExit, onFirestoreError }: FightingGameProps) {
  const [screen, setScreen] = useState<'title' | 'select' | 'arena' | 'victory' | 'gameover'>('title');
  const [playMode, setPlayMode] = useState<'arcade' | 'online'>('arcade');
  const [selectedChar, setSelectedChar] = useState<FighterId>('scorpio');
  const [selectedStage, setSelectedStage] = useState<StageId>(1);
  const [arcadeStageIdx, setArcadeStageIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [bannerReady, setBannerReady] = useState(false);
  const [spriteProgress, setSpriteProgress] = useState(() => getSpriteLoadStatus());
  const [showTouchPad, setShowTouchPad] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFirstTouch = () => setShowTouchPad(true);
    window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', onFirstTouch);
  }, []);

  const [playerName, setPlayerName] = useState<string>(() => {
    if (currentStudent?.nama) {
      return currentStudent.kelas ? `${currentStudent.nama} (${currentStudent.kelas})` : currentStudent.nama;
    }
    return isAdmin ? 'Guru / Admin' : 'Petarung Tamu';
  });

  const playerUidRef = useRef<string>('');
  if (!playerUidRef.current && typeof window !== 'undefined') {
    let savedUid = sessionStorage.getItem('kombat_tab_uid');
    if (!savedUid) {
      const base = currentStudent?.id || (isAdmin ? 'admin' : 'guest');
      savedUid = `${base}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('kombat_tab_uid', savedUid);
    }
    playerUidRef.current = savedUid;
  }

  // Multiplayer Matchmaking States (Firebase Firestore)
  const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'waiting' | 'matched' | 'error'>('idle');
  const [matchError, setMatchError] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeMatchDoc, setActiveMatchDoc] = useState<OnlineMatchDoc | null>(null);
  const [mySide, setMySide] = useState<'p1' | 'p2'>('p1');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [onlineOutcomeMsg, setOnlineOutcomeMsg] = useState<string | null>(null);

  const charCardRefs = useRef<Partial<Record<FighterId, HTMLDivElement | null>>>({});
  const matchUnsubRef = useRef<(() => void) | null>(null);
  const activeMatchIdRef = useRef<string | null>(null);
  const mySideRef = useRef<'p1' | 'p2'>('p1');
  const playModeRef = useRef<'arcade' | 'online'>('arcade');
  const selectedStageRef = useRef<StageId>(1);

  useEffect(() => {
    activeMatchIdRef.current = activeMatchId;
  }, [activeMatchId]);

  useEffect(() => {
    mySideRef.current = mySide;
  }, [mySide]);

  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);

  useEffect(() => {
    selectedStageRef.current = selectedStage;
    if (screen !== 'title') {
      prioritizeArenaBackground(selectedStage);
    }
  }, [selectedStage, screen]);

  useEffect(() => {
    if (screen !== 'title') {
      prioritizeFighterSprites(selectedChar);
    }
  }, [selectedChar, screen]);

  // Prioritize Title Banner painting BEFORE preloading & chroma-keying 45+ combat sprites!
  useEffect(() => {
    const startBackgroundAssets = () => {
      ensureArenaBackgroundsLoaded();
      ensureFighterSpritesLoaded();
    };
    if (screen !== 'title' || bannerReady) {
      const t = setTimeout(startBackgroundAssets, screen === 'title' ? 140 : 0);
      return () => clearTimeout(t);
    }
    const fallbackTimer = setTimeout(startBackgroundAssets, 650);
    return () => clearTimeout(fallbackTimer);
  }, [screen, bannerReady]);

  useEffect(() => {
    const unsubProgress = subscribeSpriteLoadProgress((loaded, total) => {
      setSpriteProgress({ loaded, total });
    });

    // Validate Firestore connection on mount
    getDocFromServer(doc(db, 'kombat_matches', '_ping')).catch((err) => {
      if (err instanceof Error && err.message.includes('the client is offline')) {
        console.error('Firebase Firestore offline:', err);
      }
    });

    return () => {
      unsubProgress();
    };
  }, []);

  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [hudState, setHudState] = useState<{
    pHp: number;
    pMax: number;
    pEnergy: number;
    eHp: number;
    eMax: number;
    timer: number;
    finishHim: boolean;
    combo: number;
    fatalityActive: boolean;
    fatalityVideo: {
      fighterId: FighterId;
      attackerName: string;
      fatalityName: string;
      videoUrl: string;
      key: number;
    } | null;
  }>({
    pHp: 100,
    pMax: 100,
    pEnergy: 0,
    eHp: 100,
    eMax: 100,
    timer: 99,
    finishHim: false,
    combo: 0,
    fatalityActive: false,
    fatalityVideo: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<MkAudioSynth | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const scoreRef = useRef(0);
  const isSavingRef = useRef(false);

  // Multiplayer realtime sync refs
  const localAttackNonceRef = useRef(0);
  const pendingLocalAttackRef = useRef<CombatActionName | undefined>(undefined);
  const lastRemoteP2AttackNonceRef = useRef(0);
  const lastAppliedHostSeqRef = useRef(-1);
  const lastAppliedBannerIdRef = useRef(0);
  const bannerIdCounterRef = useRef(1);
  const hostSeqCounterRef = useRef(1);
  const lastNetworkSendMsRef = useRef(0);
  const lastSentSnapHashRef = useRef('');

  useEffect(() => {
    synthRef.current = new MkAudioSynth();
    return () => {
      synthRef.current?.stopBgm();
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    synthRef.current?.setMuted(next);
    if (!next && screen === 'arena') synthRef.current?.startBgm();
  };

  const saveScoreToDb = useCallback(
    async (finalScore: number) => {
      if (!currentStudent || isAdmin || isSavingRef.current) return;
      isSavingRef.current = true;
      try {
        const scoreId = `${currentStudent.id}_infokombat_${Date.now()}`;
        await setDoc(doc(db, 'game_scores', scoreId), {
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          kelas: currentStudent.kelas,
          gameId: 'infokombat',
          gameTitle: 'Informatika Kombat',
          score: finalScore,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error saving fighting score:', err);
        onFirestoreError?.(err, 'write', 'game_scores');
      } finally {
        isSavingRef.current = false;
      }
    },
    [currentStudent, isAdmin, onFirestoreError]
  );

  const engineRef = useRef<{
    player: FighterRuntime;
    enemy: FighterRuntime;
    projectiles: Projectile[];
    particles: Particle[];
    banners: FloatingBanner[];
    timer: number;
    timerAcc: number;
    phase: 'intro' | 'fight' | 'finish_him' | 'fatality_cinematic' | 'round_end';
    phaseTimer: number;
    shake: number;
    hitStop: number;
    fatalityDark: number;
    fatalityCine: {
      frame: number;
      total: number;
      attackerSide: 'player' | 'enemy';
      fighterId: FighterId;
      variantId: string;
      fatalityName: string;
      videoUrl: string;
      attackerX: number;
      targetX: number;
      targetY: number;
    } | null;
    pWins: number;
    eWins: number;
    round: number;
    stageIdx: number;
    stageId: StageId;
    aiCooldown: number;
    mode: 'arcade' | 'online';
    mySide: 'p1' | 'p2';
    p1Label: string;
    p2Label: string;
    lastBannerSent?: { id: number; text: string; subtext?: string; color: string; x: number; y: number; scale?: number };
    onlineFinished?: boolean;
  } | null>(null);

  const makeFighterRuntime = (profile: FighterProfile, x: number, facing: 1 | -1, isLocalPlayer: boolean): FighterRuntime => ({
    profile,
    x,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing,
    hp: profile.maxHp,
    trailHp: profile.maxHp,
    energy: 35,
    pose: 'idle',
    poseTimer: 0,
    poseDuration: 0,
    hasHitCurrentAttack: false,
    isBlocking: false,
    isCrouching: false,
    chillTimer: 0,
    comboCount: 0,
    comboResetTimer: 0,
    walkPhase: 0,
    isLocalPlayer,
  });

  const initRound = useCallback(
    (
      playerId: FighterId,
      stageIndex: number,
      roundN: number,
      pW: number,
      eW: number,
      options?: {
        mode: 'arcade' | 'online';
        mySide: 'p1' | 'p2';
        p2FighterId: FighterId;
        p1Label: string;
        p2Label: string;
        stageId?: StageId;
      }
    ) => {
      const stageCfg = ARCADE_ENEMIES[stageIndex] || ARCADE_ENEMIES[0];
      const isOnline = options?.mode === 'online';
      const side = options?.mySide || 'p1';
      const chosenStageId: StageId =
        options?.stageId ?? (stageIndex === 0 ? selectedStageRef.current : stageCfg.stage);
      const arenaInfo = ARENAS.find((a) => a.id === chosenStageId) || ARENAS[0];
      const pProf = FIGHTERS[playerId];
      const eProf = FIGHTERS[isOnline && options ? options.p2FighterId : stageCfg.fighter];

      prioritizeArenaBackground(chosenStageId);
      prioritizeFighterSprites(pProf.id);
      prioritizeFighterSprites(eProf.id);
      prewarmFatalityVideo(pProf.id);
      prewarmFatalityVideo(eProf.id);

      setHudState((prev) => ({
        ...prev,
        fatalityActive: false,
        fatalityVideo: null,
        finishHim: false,
      }));

      engineRef.current = {
        player: makeFighterRuntime(pProf, 200, 1, !isOnline || side === 'p1'),
        enemy: makeFighterRuntime(eProf, 600, -1, isOnline && side === 'p2'),
        projectiles: [],
        particles: [],
        banners: [
          {
            text: `ROUND ${roundN}`,
            subtext: isOnline ? `${options?.p1Label} VS ${options?.p2Label}` : arenaInfo.name.toUpperCase(),
            color: '#fbbf24',
            x: STAGE_W / 2,
            y: 195,
            life: 110,
            scale: 1.2,
          },
        ],
        timer: 99,
        timerAcc: 0,
        phase: 'intro',
        phaseTimer: 115,
        shake: 0,
        hitStop: 0,
        fatalityDark: 0,
        fatalityCine: null,
        pWins: pW,
        eWins: eW,
        round: roundN,
        stageIdx: stageIndex,
        stageId: chosenStageId,
        aiCooldown: 25,
        mode: isOnline ? 'online' : 'arcade',
        mySide: side,
        p1Label: options?.p1Label || pProf.name,
        p2Label: options?.p2Label || eProf.name,
        onlineFinished: false,
      };
      setRoundNum(roundN);
      setPlayerWins(pW);
      setEnemyWins(eW);
      synthRef.current?.playSfx('gong');
    },
    []
  );

  const cleanupMatchSubscription = useCallback(() => {
    if (matchUnsubRef.current) {
      matchUnsubRef.current();
      matchUnsubRef.current = null;
    }
  }, []);

  const leaveOnlineMatch = useCallback(
    async (markAbandoned = true) => {
      cleanupMatchSubscription();
      const mid = activeMatchIdRef.current;
      setActiveMatchId(null);
      setActiveMatchDoc(null);
      setMatchStatus('idle');
      setMatchError(null);

      if (mid && markAbandoned) {
        try {
          const ref = doc(db, 'kombat_matches', mid);
          if (mySideRef.current === 'p1') {
            await updateDoc(ref, {
              status: 'abandoned',
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          } else {
            await updateDoc(ref, {
              status: 'abandoned',
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }
        } catch (err) {
          console.error('Error leaving match:', err);
        }
      }
    },
    [cleanupMatchSubscription]
  );

  useEffect(() => {
    return () => {
      cleanupMatchSubscription();
    };
  }, [cleanupMatchSubscription]);

  const startArcade = useCallback(
    (charId: FighterId) => {
      cleanupMatchSubscription();
      setPlayMode('arcade');
      setSelectedChar(charId);
      scoreRef.current = 0;
      setScore(0);
      setOnlineOutcomeMsg(null);
      setArcadeStageIdx(0);
      initRound(charId, 0, 1, 0, 0);
      setScreen('arena');
      synthRef.current?.startBgm();
    },
    [cleanupMatchSubscription, initRound]
  );

  const launchOnlineBattle = useCallback(
    (m: OnlineMatchDoc, side: 'p1' | 'p2') => {
      if (!m.p2Fighter || !m.p2Name) return;
      scoreRef.current = 0;
      setScore(0);
      setOnlineOutcomeMsg(null);
      setArcadeStageIdx(0);
      lastRemoteP2AttackNonceRef.current = 0;
      lastAppliedHostSeqRef.current = -1;
      lastAppliedBannerIdRef.current = 0;
      localAttackNonceRef.current = 0;
      pendingLocalAttackRef.current = undefined;
      lastSentSnapHashRef.current = '';

      initRound(m.p1Fighter, 0, 1, 0, 0, {
        mode: 'online',
        mySide: side,
        p2FighterId: m.p2Fighter,
        p1Label: m.p1Name,
        p2Label: m.p2Name,
        stageId: m.stage || 1,
      });
      setScreen('arena');
      synthRef.current?.startBgm();
    },
    [initRound]
  );

  const subscribeToMatch = useCallback(
    (matchId: string, side: 'p1' | 'p2') => {
      cleanupMatchSubscription();
      setActiveMatchId(matchId);
      activeMatchIdRef.current = matchId;
      setMySide(side);
      mySideRef.current = side;
      let battleLaunched = false;

      const matchRef = doc(db, 'kombat_matches', matchId);
      const unsub = onSnapshot(
        matchRef,
        (snap) => {
          if (!snap.exists()) {
            setMatchStatus('idle');
            setMatchError('Room pertandingan telah ditutup.');
            cleanupMatchSubscription();
            return;
          }
          const data = { id: snap.id, ...(snap.data() as Omit<OnlineMatchDoc, 'id'>) };
          setActiveMatchDoc(data);

          if (data.status === 'abandoned') {
            cleanupMatchSubscription();
            synthRef.current?.stopBgm();
            if (battleLaunched) {
              setOnlineOutcomeMsg('Lawan keluar dari arena. Kamu dinyatakan menang WO!');
              setScreen('victory');
            } else {
              setMatchStatus('idle');
              setMatchError('Lawan membatalkan pertandingan.');
            }
            return;
          }

          if (data.status === 'active' && data.p2Uid && data.p2Fighter && !battleLaunched) {
            battleLaunched = true;
            setMatchStatus('matched');
            setTimeout(() => {
              launchOnlineBattle(data, side);
            }, 650);
          }

          // Live Combat Reconciliation while in Arena
          const st = engineRef.current;
          if (st && st.mode === 'online' && data.status === 'active') {
            if (side === 'p1' && data.p2Snap) {
              const p2s = data.p2Snap;
              const e = st.enemy;
              // Smoothly steer remote P2 position
              const dx = p2s.x - e.x;
              if (Math.abs(dx) > 45) e.x = p2s.x;
              else e.x += dx * 0.45;
              const dy = p2s.y - e.y;
              if (Math.abs(dy) > 40) e.y = p2s.y;
              else e.y += dy * 0.5;
              e.facing = p2s.facing;
              e.isBlocking = p2s.isBlocking;
              e.isCrouching = p2s.isCrouching;

              if (p2s.attackNonce > lastRemoteP2AttackNonceRef.current) {
                lastRemoteP2AttackNonceRef.current = p2s.attackNonce;
                const act = p2s.attackAction;
                if (st.phase === 'finish_him' && (act === 'fatality' || act === 'special' || act === 'uppercut')) {
                  // Remote P2 triggers fatality on P1!
                  const chosen = pickRandomFatalityVariant(e.profile.id);
                  st.phase = 'fatality_cinematic';
                  st.phaseTimer = 180;
                  st.fatalityDark = 0.92;
                  st.shake = 24;
                  st.fatalityCine = {
                    frame: 0,
                    total: 180,
                    attackerSide: 'enemy',
                    fighterId: e.profile.id,
                    variantId: chosen.id,
                    fatalityName: chosen.name,
                    videoUrl: chosen.url,
                    attackerX: e.x,
                    targetX: st.player.x,
                    targetY: st.player.y,
                  };
                  e.pose = 'special';
                  e.poseTimer = 70;
                  e.poseDuration = 70;
                  st.player.pose = 'dizzy';
                  setHudState((prev) => ({
                    ...prev,
                    fatalityActive: true,
                    fatalityVideo: {
                      fighterId: e.profile.id,
                      attackerName: e.profile.name,
                      fatalityName: chosen.name,
                      videoUrl: chosen.url,
                      key: Date.now(),
                    },
                  }));
                  synthRef.current?.playSfx('fatality');
                } else if (act && st.phase === 'fight') {
                  const hasSeq = Boolean(FIGHTER_SPRITE_CONFIG[e.profile.id]?.actionFrames);
                  if (act === 'jump' && e.y >= GROUND_Y - 1) {
                    e.vy = -15.5;
                    e.pose = 'jump';
                  } else if (act === 'special' && e.energy >= 30) {
                    e.energy -= 30;
                    e.pose = 'special';
                    e.poseTimer = hasSeq ? 28 : 24;
                    e.poseDuration = e.poseTimer;
                    e.hasHitCurrentAttack = true;
                    synthRef.current?.playSfx('fireball');
                    st.projectiles.push({
                      owner: 'enemy',
                      originX: e.x + e.facing * 24,
                      x: e.x + e.facing * 44,
                      y: e.y - 72,
                      vx: e.facing * 9.8,
                      type: e.profile.projectileType,
                      color: e.profile.projectileColor,
                      core: e.profile.projectileCore,
                      damage: Math.round(16 * e.profile.power),
                      chill: e.profile.id === 'subbyte',
                      pull: e.profile.id === 'scorpio',
                      life: 85,
                    });
                  } else if (act === 'fatality' && e.energy >= 100) {
                    e.energy = 0;
                    if (st.player.hp <= 45) {
                      const chosen = pickRandomFatalityVariant(e.profile.id);
                      st.player.hp = 0;
                      st.eWins = Math.min(2, st.eWins + 1);
                      setEnemyWins(st.eWins);
                      st.phase = 'fatality_cinematic';
                      st.phaseTimer = 180;
                      st.fatalityDark = 0.92;
                      st.shake = 24;
                      st.fatalityCine = {
                        frame: 0,
                        total: 180,
                        attackerSide: 'enemy',
                        fighterId: e.profile.id,
                        variantId: chosen.id,
                        fatalityName: chosen.name,
                        videoUrl: chosen.url,
                        attackerX: e.x,
                        targetX: st.player.x,
                        targetY: st.player.y,
                      };
                      e.pose = 'special';
                      e.poseTimer = 70;
                      e.poseDuration = 70;
                      setHudState((prev) => ({
                        ...prev,
                        fatalityActive: true,
                        fatalityVideo: {
                          fighterId: e.profile.id,
                          attackerName: e.profile.name,
                          fatalityName: chosen.name,
                          videoUrl: chosen.url,
                          key: Date.now(),
                        },
                      }));
                      synthRef.current?.playSfx('fatality');
                    } else {
                      e.pose = 'uppercut';
                      e.poseTimer = 32;
                      e.poseDuration = 32;
                      e.hasHitCurrentAttack = false;
                      st.shake = 12;
                      synthRef.current?.playSfx('heavy');
                      st.projectiles.push({
                        owner: 'enemy',
                        originX: e.x + e.facing * 24,
                        x: e.x + e.facing * 44,
                        y: e.y - 72,
                        vx: e.facing * 11.5,
                        type: e.profile.projectileType,
                        color: '#ef4444',
                        core: '#fef08a',
                        damage: 38,
                        life: 80,
                      });
                    }
                  } else if (['punch', 'kick', 'uppercut', 'sweep'].includes(act)) {
                    e.pose = e.y < GROUND_Y - 5 ? 'jump_kick' : (act as PoseState);
                    e.poseTimer =
                      act === 'uppercut'
                        ? hasSeq ? 26 : 24
                        : act === 'sweep'
                        ? hasSeq ? 24 : 22
                        : act === 'kick'
                        ? hasSeq ? 24 : 20
                        : hasSeq ? 20 : 14;
                    e.poseDuration = e.poseTimer;
                    e.hasHitCurrentAttack = false;
                    synthRef.current?.playSfx(act === 'uppercut' ? 'heavy' : act === 'punch' ? 'punch' : 'kick');
                  }
                }
              } else if (['idle', 'walk', 'crouch', 'block', 'jump'].includes(p2s.pose) && !['hit', 'knockdown', 'ko', 'dizzy'].includes(e.pose)) {
                if (e.poseTimer <= 0) {
                  e.pose = p2s.pose;
                  if (p2s.pose === 'walk') e.walkPhase += 0.28;
                }
              }
            } else if (side === 'p2' && data.hostSync && data.hostSync.seq > lastAppliedHostSeqRef.current) {
              const hs = data.hostSync;
              lastAppliedHostSeqRef.current = hs.seq;

              // Check round change from host
              if (hs.round !== st.round) {
                initRound(data.p1Fighter, 0, hs.round, hs.p1Wins, hs.p2Wins, {
                  mode: 'online',
                  mySide: 'p2',
                  p2FighterId: data.p2Fighter!,
                  p1Label: data.p1Name,
                  p2Label: data.p2Name!,
                  stageId: data.stage || 1,
                });
                return;
              }

              // Reconcile P1 (enemy on left)
              const p1r = st.player;
              const dx = hs.p1.x - p1r.x;
              if (Math.abs(dx) > 45) p1r.x = hs.p1.x;
              else p1r.x += dx * 0.55;
              p1r.y = hs.p1.y;
              p1r.facing = hs.p1.facing;
              p1r.hp = hs.p1.hp;
              p1r.energy = hs.p1.energy;
              p1r.chillTimer = hs.p1.chillTimer;
              p1r.isBlocking = hs.p1.isBlocking;
              p1r.isCrouching = hs.p1.isCrouching;
              if (p1r.pose !== hs.p1.pose && ['punch', 'kick', 'uppercut', 'sweep', 'special', 'jump_kick'].includes(hs.p1.pose)) {
                synthRef.current?.playSfx(hs.p1.pose === 'special' ? 'fireball' : hs.p1.pose === 'uppercut' ? 'heavy' : hs.p1.pose === 'punch' ? 'punch' : 'kick');
              }
              p1r.pose = hs.p1.pose;
              p1r.poseTimer = hs.p1.poseTimer;
              p1r.poseDuration = hs.p1.poseDuration;

              // Reconcile P2 authoritative HP/Energy/Hit states
              const p2r = st.enemy;
              if (hs.p2Hp < p2r.hp) {
                synthRef.current?.playSfx('punch');
                st.shake = 6;
              }
              p2r.hp = hs.p2Hp;
              p2r.energy = hs.p2Energy;
              p2r.chillTimer = hs.p2ChillTimer;
              if (hs.p2PoseOverride && ['hit', 'knockdown', 'ko', 'dizzy', 'victory'].includes(hs.p2PoseOverride)) {
                p2r.pose = hs.p2PoseOverride;
                if (hs.p2PoseTimer !== undefined) p2r.poseTimer = hs.p2PoseTimer;
              }

              st.timer = hs.timer;
              if (hs.phase === 'fatality_cinematic' && st.phase !== 'fatality_cinematic') {
                const attackerSide = hs.fatalityAttacker || 'player';
                const att = attackerSide === 'player' ? st.player : st.enemy;
                const def = attackerSide === 'player' ? st.enemy : st.player;
                const variantId = hs.fatalityVariantId || `sig_${att.profile.id}`;
                const fatName = hs.fatalityVariantName || att.profile.fatalityName;
                const fatUrl = getFatalityVideoByVariant(att.profile.id, variantId);
                st.fatalityDark = 0.92;
                st.shake = 24;
                st.fatalityCine = {
                  frame: 0,
                  total: 180,
                  attackerSide,
                  fighterId: att.profile.id,
                  variantId,
                  fatalityName: fatName,
                  videoUrl: fatUrl,
                  attackerX: att.x,
                  targetX: def.x,
                  targetY: def.y,
                };
                setHudState((prev) => ({
                  ...prev,
                  fatalityActive: true,
                  fatalityVideo: {
                    fighterId: att.profile.id,
                    attackerName: att.profile.name,
                    fatalityName: fatName,
                    videoUrl: fatUrl,
                    key: Date.now(),
                  },
                }));
                synthRef.current?.playSfx('fatality');
              } else if (hs.phase !== 'fatality_cinematic' && st.phase === 'fatality_cinematic') {
                setHudState((prev) => ({ ...prev, fatalityActive: false, fatalityVideo: null }));
              }
              st.phase = hs.phase;
              st.phaseTimer = hs.phaseTimer;
              st.pWins = hs.p1Wins;
              st.eWins = hs.p2Wins;
              setPlayerWins(hs.p1Wins);
              setEnemyWins(hs.p2Wins);

              st.projectiles = (hs.projectiles || []).map((pr) => ({ ...pr }));

              if (hs.bannerEvent && hs.bannerEvent.id > lastAppliedBannerIdRef.current) {
                lastAppliedBannerIdRef.current = hs.bannerEvent.id;
                st.banners.push({
                  text: hs.bannerEvent.text,
                  subtext: hs.bannerEvent.subtext,
                  color: hs.bannerEvent.color,
                  x: hs.bannerEvent.x,
                  y: hs.bannerEvent.y,
                  life: 115,
                  scale: hs.bannerEvent.scale || 1.1,
                });
              }
            }
          }

          if (data.status === 'finished' && data.winnerSide && battleLaunched) {
            cleanupMatchSubscription();
            synthRef.current?.stopBgm();
            const iWon = data.winnerSide === side;
            if (iWon) {
              scoreRef.current += 2000;
              setScore(scoreRef.current);
              saveScoreToDb(scoreRef.current);
              setOnlineOutcomeMsg(`Kamu mengalahkan ${side === 'p1' ? data.p2Name : data.p1Name} (${data.p1Wins} - ${data.p2Wins})!`);
              setScreen('victory');
            } else {
              saveScoreToDb(scoreRef.current);
              setOnlineOutcomeMsg(`${side === 'p1' ? data.p2Name : data.p1Name} memenangkan duel (${data.p1Wins} - ${data.p2Wins}).`);
              setScreen('gameover');
            }
          }
        },
        (error) => {
          const formatted = formatKombatFirestoreError(error, OperationType.GET, `kombat_matches/${matchId}`);
          setMatchStatus('error');
          setMatchError('Koneksi ke server matchmaking terputus.');
          onFirestoreError?.(formatted, 'get', `kombat_matches/${matchId}`);
        }
      );

      matchUnsubRef.current = unsub;
    },
    [cleanupMatchSubscription, initRound, launchOnlineBattle, onFirestoreError, saveScoreToDb]
  );

  const startQuickMatchmaking = useCallback(
    async (charId: FighterId) => {
      setSelectedChar(charId);
      setPlayMode('online');
      setMatchError(null);
      setMatchStatus('searching');

      const myUid = playerUidRef.current;
      const myName = (playerName || 'Petarung').trim().slice(0, 48);

      try {
        const waitingQ = query(collection(db, 'kombat_matches'), where('status', '==', 'waiting'), limit(15));
        const snap = await getDocs(waitingQ);
        const nowMs = Date.now();
        let joinedMatchId: string | null = null;

        for (const docSnap of snap.docs) {
          const d = docSnap.data() as Omit<OnlineMatchDoc, 'id'>;
          if (!d.isPublic || d.p1Uid === myUid || d.p2Uid) continue;
          const createdMs = d.createdAt?.toMillis ? d.createdAt.toMillis() : nowMs;
          if (nowMs - createdMs > 10 * 60 * 1000) continue;

          try {
            const didJoin = await runTransaction(db, async (tx) => {
              const latest = await tx.get(docSnap.ref);
              if (!latest.exists()) return false;
              const ld = latest.data() as Omit<OnlineMatchDoc, 'id'>;
              if (ld.status !== 'waiting' || ld.p2Uid) return false;
              tx.update(docSnap.ref, {
                p2Uid: myUid,
                p2Name: myName,
                p2Fighter: charId,
                status: 'active',
                updatedAt: serverTimestamp(),
              });
              return true;
            });
            if (didJoin) {
              joinedMatchId = docSnap.id;
              break;
            }
          } catch {
            // Another player took this room concurrently; continue checking next
          }
        }

        if (joinedMatchId) {
          setMatchStatus('matched');
          subscribeToMatch(joinedMatchId, 'p2');
          return;
        }

        // Create a new public matchmaking room and wait for an opponent
        const newRef = doc(collection(db, 'kombat_matches'));
        const code = `MK${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        await setDoc(newRef, {
          roomCode: code,
          isPublic: true,
          status: 'waiting',
          stage: selectedStageRef.current,
          round: 1,
          p1Uid: myUid,
          p1Name: myName,
          p1Fighter: charId,
          p1Wins: 0,
          p2Uid: null,
          p2Name: null,
          p2Fighter: null,
          p2Wins: 0,
          winnerSide: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setMatchStatus('waiting');
        subscribeToMatch(newRef.id, 'p1');
      } catch (err) {
        const formatted = formatKombatFirestoreError(err, OperationType.WRITE, 'kombat_matches');
        setMatchStatus('error');
        setMatchError('Gagal terhubung ke server matchmaking Firebase.');
        onFirestoreError?.(formatted, 'write', 'kombat_matches');
      }
    },
    [onFirestoreError, playerName, subscribeToMatch]
  );

  const createPrivateRoom = useCallback(
    async (charId: FighterId) => {
      setSelectedChar(charId);
      setPlayMode('online');
      setMatchError(null);
      setMatchStatus('searching');

      const myUid = playerUidRef.current;
      const myName = (playerName || 'Petarung').trim().slice(0, 48);

      try {
        const newRef = doc(collection(db, 'kombat_matches'));
        const code = `MK${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        await setDoc(newRef, {
          roomCode: code,
          isPublic: false,
          status: 'waiting',
          stage: selectedStageRef.current,
          round: 1,
          p1Uid: myUid,
          p1Name: myName,
          p1Fighter: charId,
          p1Wins: 0,
          p2Uid: null,
          p2Name: null,
          p2Fighter: null,
          p2Wins: 0,
          winnerSide: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setMatchStatus('waiting');
        subscribeToMatch(newRef.id, 'p1');
      } catch (err) {
        const formatted = formatKombatFirestoreError(err, OperationType.CREATE, 'kombat_matches');
        setMatchStatus('error');
        setMatchError('Gagal membuat room duel Firebase.');
        onFirestoreError?.(formatted, 'create', 'kombat_matches');
      }
    },
    [onFirestoreError, playerName, subscribeToMatch]
  );

  const joinRoomByCode = useCallback(
    async (charId: FighterId) => {
      const code = joinCodeInput.trim().toUpperCase();
      if (code.length < 4) {
        setMatchError('Masukkan kode room minimal 4 karakter.');
        return;
      }
      setSelectedChar(charId);
      setPlayMode('online');
      setMatchError(null);
      setMatchStatus('searching');

      const myUid = playerUidRef.current;
      const myName = (playerName || 'Petarung').trim().slice(0, 48);

      try {
        const q = query(collection(db, 'kombat_matches'), where('roomCode', '==', code), limit(5));
        const snap = await getDocs(q);
        const target = snap.docs.find((d) => d.data().status === 'waiting' && !d.data().p2Uid);
        if (!target) {
          setMatchStatus('idle');
          setMatchError(`Room "${code}" tidak ditemukan atau sudah penuh.`);
          return;
        }
        if (target.data().p1Uid === myUid) {
          setMatchStatus('idle');
          setMatchError('Tidak bisa bergabung ke room sendiri dari tab yang sama.');
          return;
        }

        const joined = await runTransaction(db, async (tx) => {
          const latest = await tx.get(target.ref);
          if (!latest.exists()) return false;
          const ld = latest.data() as Omit<OnlineMatchDoc, 'id'>;
          if (ld.status !== 'waiting' || ld.p2Uid) return false;
          tx.update(target.ref, {
            p2Uid: myUid,
            p2Name: myName,
            p2Fighter: charId,
            status: 'active',
            updatedAt: serverTimestamp(),
          });
          return true;
        });

        if (!joined) {
          setMatchStatus('idle');
          setMatchError('Room baru saja diambil pemain lain.');
          return;
        }

        setMatchStatus('matched');
        subscribeToMatch(target.id, 'p2');
      } catch (err) {
        const formatted = formatKombatFirestoreError(err, OperationType.UPDATE, 'kombat_matches');
        setMatchStatus('error');
        setMatchError('Gagal bergabung ke room.');
        onFirestoreError?.(formatted, 'update', 'kombat_matches');
      }
    },
    [joinCodeInput, onFirestoreError, playerName, subscribeToMatch]
  );

  const cancelMatchmaking = useCallback(async () => {
    cleanupMatchSubscription();
    const mid = activeMatchIdRef.current;
    setActiveMatchId(null);
    setActiveMatchDoc(null);
    setMatchStatus('idle');
    setMatchError(null);
    if (mid) {
      await deleteDoc(doc(db, 'kombat_matches', mid)).catch(() => {});
    }
  }, [cleanupMatchSubscription]);

  const launchFatalityCinematic = useCallback(
    (st: NonNullable<typeof engineRef.current>, attackerSide: 'player' | 'enemy') => {
      const attacker = attackerSide === 'player' ? st.player : st.enemy;
      const victim = attackerSide === 'player' ? st.enemy : st.player;
      const chosen = pickRandomFatalityVariant(attacker.profile.id);

      st.phase = 'fatality_cinematic';
      st.phaseTimer = 180;
      st.fatalityDark = 0.92;
      st.shake = 26;
      st.fatalityCine = {
        frame: 0,
        total: 180,
        attackerSide,
        fighterId: attacker.profile.id,
        variantId: chosen.id,
        fatalityName: chosen.name,
        videoUrl: chosen.url,
        attackerX: attacker.x,
        targetX: victim.x,
        targetY: victim.y,
      };
      attacker.pose = 'special';
      attacker.poseTimer = 85;
      attacker.poseDuration = 85;
      victim.pose = 'dizzy';
      victim.vx = 0;

      setHudState((prev) => ({
        ...prev,
        fatalityActive: true,
        fatalityVideo: {
          fighterId: attacker.profile.id,
          attackerName: attacker.profile.name,
          fatalityName: chosen.name,
          videoUrl: chosen.url,
          key: Date.now(),
        },
      }));

      synthRef.current?.playSfx('fatality');
      for (let i = 0; i < 95; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2.5 + Math.random() * 10.5;
        st.particles.push({
          x: victim.x + (Math.random() - 0.5) * 28,
          y: victim.y - 55 + (Math.random() - 0.5) * 45,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 3.5,
          size: 4 + Math.random() * 7,
          color: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? attacker.profile.projectileColor : '#fde047',
          life: 75,
          maxLife: 75,
          gravity: 0.22,
        });
      }

      if ((attackerSide === 'player' && st.mySide === 'p1') || (attackerSide === 'enemy' && st.mySide === 'p2')) {
        scoreRef.current += 1500;
        setScore(scoreRef.current);
      }

      const bId = bannerIdCounterRef.current++;
      st.lastBannerSent = {
        id: bId,
        text: 'FATALITY!',
        subtext: `${chosen.name} · +1500 BONUS`,
        color: '#ef4444',
        x: STAGE_W / 2,
        y: 185,
        scale: 1.5,
      };
    },
    []
  );

  const triggerAction = useCallback(
    (action: CombatActionName) => {
      const st = engineRef.current;
      if (!st) return;

      const isP2Local = st.mode === 'online' && st.mySide === 'p2';
      const p = isP2Local ? st.enemy : st.player;
      const opp = isP2Local ? st.player : st.enemy;
      const myRoleSide: 'player' | 'enemy' = isP2Local ? 'enemy' : 'player';

      // Notify network for P2 immediate strike relay
      if (isP2Local) {
        localAttackNonceRef.current += 1;
        pendingLocalAttackRef.current = action;
      }

      if (st.phase === 'finish_him' && (action === 'fatality' || action === 'special' || action === 'uppercut')) {
        if (!isP2Local) {
          launchFatalityCinematic(st, 'player');
        } else {
          // Optimistically animate on P2 while host confirms
          p.pose = 'special';
          p.poseTimer = 60;
          p.poseDuration = 60;
          synthRef.current?.playSfx('fatality');
        }
        return;
      }

      if (st.phase !== 'fight' && st.phase !== 'finish_him') return;
      if (p.pose === 'hit' || p.pose === 'knockdown' || p.pose === 'ko') return;

      if (action === 'jump') {
        if (p.y >= GROUND_Y - 1) {
          p.vy = -15.5;
          p.pose = 'jump';
        }
        return;
      }

      if (['punch', 'kick', 'uppercut', 'sweep', 'special', 'jump_kick'].includes(p.pose)) return;

      const hasSeq = Boolean(FIGHTER_SPRITE_CONFIG[p.profile.id]?.actionFrames);

      if (p.y < GROUND_Y - 5) {
        p.pose = 'jump_kick';
        p.poseTimer = hasSeq ? 24 : 22;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = false;
        synthRef.current?.playSfx('kick');
        return;
      }

      if (action === 'special') {
        if (p.energy < 30) return;
        p.energy -= 30;
        p.pose = 'special';
        p.poseTimer = hasSeq ? 28 : 24;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = true;
        synthRef.current?.playSfx('fireball');
        if (p.profile.id === 'scorpio') {
          st.banners.push({
            text: 'GET OVER HERE!',
            color: '#fde047',
            x: p.x,
            y: p.y - 125,
            life: 48,
            scale: 0.72,
          });
        }
        st.projectiles.push({
          owner: myRoleSide,
          originX: p.x + p.facing * 24,
          x: p.x + p.facing * 44,
          y: p.y - 72,
          vx: p.facing * 9.8,
          type: p.profile.projectileType,
          color: p.profile.projectileColor,
          core: p.profile.projectileCore,
          damage: Math.round(16 * p.profile.power),
          chill: p.profile.id === 'subbyte',
          pull: p.profile.id === 'scorpio',
          life: 85,
        });
        return;
      }

      if (action === 'fatality') {
        if (p.energy < 100) return;
        p.energy = 0;

        // If opponent is low enough on HP (<= 45), execute a direct full FATALITY cinematic!
        if (!isP2Local && opp.hp <= 45) {
          opp.hp = 0;
          st.pWins = Math.min(2, st.pWins + 1);
          setPlayerWins(st.pWins);
          launchFatalityCinematic(st, 'player');
          return;
        }

        // Otherwise unleash a dramatic high-visibility ULTRA FATAL STRIKE!
        p.pose = 'uppercut';
        p.poseTimer = 34;
        p.poseDuration = 34;
        p.hasHitCurrentAttack = false;
        st.shake = 18;
        st.fatalityDark = 0.55;
        setTimeout(() => {
          if (engineRef.current && engineRef.current.phase === 'fight') {
            engineRef.current.fatalityDark = 0;
          }
        }, 420);
        synthRef.current?.playSfx('fatality');
        p.vx = p.facing * 12;
        st.banners.push({
          text: 'ULTRA FATAL STRIKE!',
          subtext: p.profile.fatalityName,
          color: '#ef4444',
          x: STAGE_W / 2,
          y: 140,
          life: 62,
          scale: 1.15,
        });
        st.projectiles.push({
          owner: myRoleSide,
          originX: p.x + p.facing * 24,
          x: p.x + p.facing * 44,
          y: p.y - 72,
          vx: p.facing * 12.2,
          type: p.profile.projectileType,
          color: '#ef4444',
          core: '#fef08a',
          damage: 38,
          life: 80,
        });
        return;
      }

      if (action === 'uppercut') {
        p.pose = 'uppercut';
        p.poseTimer = hasSeq ? 26 : 24;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = false;
        synthRef.current?.playSfx('heavy');
      } else if (action === 'sweep') {
        p.pose = 'sweep';
        p.poseTimer = hasSeq ? 24 : 22;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = false;
        synthRef.current?.playSfx('kick');
      } else if (action === 'kick') {
        p.pose = 'kick';
        p.poseTimer = hasSeq ? 24 : 20;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = false;
        synthRef.current?.playSfx('kick');
      } else {
        p.pose = 'punch';
        p.poseTimer = hasSeq ? 20 : 14;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = false;
        synthRef.current?.playSfx('punch');
      }
    },
    [launchFatalityCinematic]
  );

  // Horizontal Character Select Keyboard Navigation: Left, Right, and Enter
  useEffect(() => {
    if (screen !== 'select') return;

    const scrollActiveCard = (fid: FighterId) => {
      const el = charCardRefs.current[fid];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    };

    const onSelectKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      if (matchStatus === 'waiting' || matchStatus === 'searching' || matchStatus === 'matched') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedChar((prev) => {
          const idx = PLAYABLE_IDS.indexOf(prev);
          const next = PLAYABLE_IDS[(idx - 1 + PLAYABLE_IDS.length) % PLAYABLE_IDS.length];
          synthRef.current?.playSfx('select');
          requestAnimationFrame(() => scrollActiveCard(next));
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedChar((prev) => {
          const idx = PLAYABLE_IDS.indexOf(prev);
          const next = PLAYABLE_IDS[(idx + 1) % PLAYABLE_IDS.length];
          synthRef.current?.playSfx('select');
          requestAnimationFrame(() => scrollActiveCard(next));
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        synthRef.current?.playSfx('gong');
        if (playModeRef.current === 'online') {
          startQuickMatchmaking(selectedChar);
        } else {
          startArcade(selectedChar);
        }
      }
    };

    window.addEventListener('keydown', onSelectKeyDown);
    return () => window.removeEventListener('keydown', onSelectKeyDown);
  }, [screen, matchStatus, selectedChar, startArcade, startQuickMatchmaking]);

  // Arena Combat Keyboard Listeners
  useEffect(() => {
    if (screen !== 'arena') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      const wasDown = keysRef.current[k];
      keysRef.current[k] = true;
      if (wasDown) return;

      const crouchHeld = keysRef.current['arrowdown'];
      if (k === 'arrowup') triggerAction('jump');
      else if (k === 'a') triggerAction(crouchHeld ? 'uppercut' : 'punch');
      else if (k === 's') triggerAction(crouchHeld ? 'sweep' : 'kick');
      else if (k === 'd') triggerAction('special');
      else if (k === 'w') triggerAction('uppercut');
      else if (k === 'f') triggerAction('fatality');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    const onWindowBlur = () => {
      keysRef.current = {};
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      keysRef.current = {};
    };
  }, [screen, triggerAction]);

  // Main 60FPS Game Loop + Fatality Cinematic + Firebase Multiplayer Sync
  useEffect(() => {
    if (screen !== 'arena') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let hudSyncCounter = 0;

    const spawnHitParticles = (x: number, y: number, color: string, count = 14) => {
      const st = engineRef.current;
      if (!st) return;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5.5;
        st.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.5,
          size: 3 + Math.random() * 4,
          color,
          life: 24,
          maxLife: 24,
          gravity: 0.25,
        });
      }
    };

    const applyHit = (
      attacker: FighterRuntime,
      defender: FighterRuntime,
      rawDmg: number,
      hitType: 'punch' | 'kick' | 'uppercut' | 'sweep' | 'projectile',
      pullEnemy = false
    ) => {
      const st = engineRef.current;
      if (!st) return;

      const blocked =
        defender.isBlocking &&
        defender.pose !== 'hit' &&
        defender.pose !== 'knockdown' &&
        defender.pose !== 'dizzy' &&
        (hitType !== 'sweep' || defender.isCrouching);

      if (blocked) {
        const chip = Math.max(1, Math.round(rawDmg * 0.2));
        defender.hp = Math.max(0, defender.hp - chip);
        defender.vx = attacker.facing * 4.5;
        defender.energy = Math.min(100, defender.energy + 6);
        spawnHitParticles(defender.x, defender.y - 68, '#38bdf8', 9);
        synthRef.current?.playSfx('block');
        return;
      }

      const dmg = Math.round(rawDmg * attacker.profile.power);
      defender.hp = Math.max(0, defender.hp - dmg);
      attacker.energy = Math.min(100, attacker.energy + 14);
      defender.energy = Math.min(100, defender.energy + 8);

      const isMyHit = (st.mySide === 'p1' && attacker === st.player) || (st.mySide === 'p2' && attacker === st.enemy);
      if (isMyHit) {
        attacker.comboCount += 1;
        attacker.comboResetTimer = 85;
        const bonus = dmg * 12 * Math.min(4, attacker.comboCount);
        scoreRef.current += bonus;
        setScore(scoreRef.current);

        if (attacker.comboCount >= 2) {
          st.banners.push({
            text: `${attacker.comboCount} HIT COMBO!`,
            color: '#fbbf24',
            x: attacker.x,
            y: attacker.y - 135,
            life: 52,
            scale: 0.72,
          });
        }
      }

      if (pullEnemy) {
        defender.pose = 'hit';
        defender.poseTimer = 26;
        defender.x = attacker.x + attacker.facing * 72;
        defender.vx = 0;
        st.shake = 7;
        st.hitStop = 3;
        synthRef.current?.playSfx('heavy');
      } else if (hitType === 'uppercut') {
        defender.pose = 'knockdown';
        defender.poseTimer = 42;
        defender.vy = -12.5;
        defender.vx = attacker.facing * 7.5;
        st.shake = 12;
        st.hitStop = 4;
        synthRef.current?.playSfx('heavy');
        if (isMyHit) {
          st.banners.push({
            text: 'TOASTY UPPERCUT!',
            color: '#f97316',
            x: STAGE_W / 2,
            y: 135,
            life: 55,
            scale: 0.9,
          });
        }
      } else if (hitType === 'sweep') {
        defender.pose = 'knockdown';
        defender.poseTimer = 36;
        defender.vy = -5;
        defender.vx = attacker.facing * 4;
        st.shake = 6;
        st.hitStop = 2;
        synthRef.current?.playSfx('heavy');
      } else {
        defender.pose = 'hit';
        defender.poseTimer = 16;
        defender.vx = attacker.facing * 5.2;
        st.shake = hitType === 'kick' ? 6 : 4;
        st.hitStop = 2;
        synthRef.current?.playSfx(hitType === 'kick' ? 'kick' : 'punch');
      }

      spawnHitParticles(defender.x, defender.y - 68, '#fde047', hitType === 'uppercut' ? 22 : 13);
      spawnHitParticles(defender.x, defender.y - 68, '#ef4444', 6);
    };

    const drawFatalityOverlay = (st: NonNullable<typeof engineRef.current>, time: number) => {
      if (st.phase === 'finish_him') {
        const pulse = 0.25 + Math.abs(Math.sin(time * 0.01)) * 0.28;
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.lineWidth = 14;
        ctx.strokeRect(7, 7, STAGE_W - 14, STAGE_H - 14);

        const targetFighter = st.mySide === 'p2' && st.mode === 'online' ? st.player : st.enemy;
        const bob = Math.sin(time * 0.015) * 6;
        ctx.translate(targetFighter.x, targetFighter.y - 148 + bob);
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = '900 15px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText('[F] FATALITY!', 0, 0);
        ctx.fillStyle = '#fde047';
        ctx.fillText('[F] FATALITY!', 0, 0);
        ctx.restore();
        return;
      }

      if (st.phase !== 'fatality_cinematic' || !st.fatalityCine) return;

      // Clean dark backdrop behind the AI Fatality MP4 video overlay (no crude vector effects!)
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      ctx.restore();
    };

    const tick = (time: number) => {
      const st = engineRef.current;
      if (!st) return;

      const isOnline = st.mode === 'online';
      const isP2Client = isOnline && st.mySide === 'p2';
      const localFighter = isP2Client ? st.enemy : st.player;

      if (st.hitStop > 0) {
        st.hitStop--;
      } else {
        const p = st.player;
        const e = st.enemy;

        p.trailHp += (p.hp - p.trailHp) * 0.08;
        e.trailHp += (e.hp - e.trailHp) * 0.08;

        if (st.shake > 0) st.shake *= 0.82;
        if (st.shake < 0.4) st.shake = 0;

        // Always update local player's movement immediately for crisp 60fps controls
        if (st.phase === 'fight' || st.phase === 'finish_him') {
          const left = keysRef.current['arrowleft'];
          const right = keysRef.current['arrowright'];
          const down = keysRef.current['arrowdown'];
          const blockKey = keysRef.current[' '];

          localFighter.isBlocking = Boolean(blockKey);
          localFighter.isCrouching = Boolean(down) && localFighter.y >= GROUND_Y - 1;

          const canMoveLocal = ['idle', 'walk', 'jump', 'crouch', 'block'].includes(localFighter.pose);
          if (canMoveLocal) {
            if (localFighter.isBlocking && localFighter.y >= GROUND_Y - 1 && st.phase === 'fight') {
              localFighter.pose = 'block';
              localFighter.vx = 0;
            } else if (localFighter.isCrouching && st.phase === 'fight') {
              localFighter.pose = 'crouch';
              localFighter.vx = 0;
            } else if (left) {
              localFighter.vx = -localFighter.profile.speed;
              if (localFighter.y >= GROUND_Y - 1) {
                localFighter.pose = 'walk';
                localFighter.walkPhase += 0.28;
              }
            } else if (right) {
              localFighter.vx = localFighter.profile.speed;
              if (localFighter.y >= GROUND_Y - 1) {
                localFighter.pose = 'walk';
                localFighter.walkPhase += 0.28;
              }
            } else {
              localFighter.vx *= 0.65;
              if (localFighter.y >= GROUND_Y - 1) localFighter.pose = 'idle';
            }
          }
        }

        if (!isP2Client) {
          // HOST / SOLO AUTHORITATIVE GAMEPLAY LOGIC
          if (st.phase === 'intro') {
            st.phaseTimer--;
            if (st.phaseTimer === 40) {
              const bId = bannerIdCounterRef.current++;
              const bObj = {
                id: bId,
                text: 'FIGHT!',
                color: '#ef4444',
                x: STAGE_W / 2,
                y: 195,
                scale: 1.45,
              };
              st.banners.push({ ...bObj, life: 55 });
              st.lastBannerSent = bObj;
              synthRef.current?.playSfx('heavy');
            }
            if (st.phaseTimer <= 0) {
              st.phase = 'fight';
            }
          } else if (st.phase === 'fight') {
            st.timerAcc++;
            if (st.timerAcc >= 60) {
              st.timerAcc = 0;
              st.timer = Math.max(0, st.timer - 1);
            }

            if (p.y >= GROUND_Y - 1 && ['idle', 'walk', 'crouch', 'block'].includes(p.pose)) {
              p.facing = e.x >= p.x ? 1 : -1;
            }
            if (e.y >= GROUND_Y - 1 && ['idle', 'walk', 'crouch', 'block'].includes(e.pose)) {
              e.facing = p.x >= e.x ? 1 : -1;
            }

            // Arcade AI only when mode === 'arcade'
            if (!isOnline) {
              const dist = Math.abs(p.x - e.x);
              const aiSpeed = e.chillTimer > 0 ? e.profile.speed * 0.48 : e.profile.speed;
              const canMoveE = ['idle', 'walk', 'jump', 'crouch', 'block'].includes(e.pose);
              if (e.chillTimer > 0) e.chillTimer--;
              if (st.aiCooldown > 0) st.aiCooldown--;

              if (canMoveE) {
                const aggressiveness = 0.55 + st.stageIdx * 0.16;
                if (e.isBlocking) {
                  e.pose = 'block';
                  e.vx = 0;
                  if (Math.random() < 0.05) e.isBlocking = false;
                } else if (dist > 110) {
                  e.vx = e.facing * aiSpeed * 0.85;
                  if (e.y >= GROUND_Y - 1) {
                    e.pose = 'walk';
                    e.walkPhase += 0.24;
                  }
                  if (dist > 250 && st.aiCooldown <= 0 && e.energy >= 30 && Math.random() < 0.06 * aggressiveness) {
                    e.energy -= 30;
                    e.pose = 'special';
                    e.poseTimer = 24;
                    e.poseDuration = 24;
                    e.hasHitCurrentAttack = true;
                    st.aiCooldown = 48;
                    synthRef.current?.playSfx('fireball');
                    st.projectiles.push({
                      owner: 'enemy',
                      originX: e.x + e.facing * 24,
                      x: e.x + e.facing * 44,
                      y: e.y - 72,
                      vx: e.facing * 8.5,
                      type: e.profile.projectileType,
                      color: e.profile.projectileColor,
                      core: e.profile.projectileCore,
                      damage: Math.round(13 * e.profile.power),
                      life: 90,
                    });
                  }
                } else {
                  e.vx *= 0.6;
                  if (e.y >= GROUND_Y - 1) e.pose = 'idle';

                  if (['punch', 'kick', 'uppercut', 'sweep'].includes(p.pose) && Math.random() < 0.22 * aggressiveness) {
                    e.isBlocking = true;
                    e.pose = 'block';
                  } else if (st.aiCooldown <= 0) {
                    const roll = Math.random();
                    if (roll < 0.36) {
                      e.pose = 'punch';
                      e.poseTimer = 15;
                      e.poseDuration = 15;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = 36 - st.stageIdx * 5;
                      synthRef.current?.playSfx('punch');
                    } else if (roll < 0.68) {
                      e.pose = 'kick';
                      e.poseTimer = 21;
                      e.poseDuration = 21;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = 42 - st.stageIdx * 5;
                      synthRef.current?.playSfx('kick');
                    } else if (roll < 0.84) {
                      e.pose = 'sweep';
                      e.poseTimer = 22;
                      e.poseDuration = 22;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = 46 - st.stageIdx * 5;
                      synthRef.current?.playSfx('kick');
                    } else if (roll < 0.94 && e.y >= GROUND_Y - 1) {
                      e.vy = -14.5;
                      e.vx = -e.facing * 3.5;
                      e.pose = 'jump';
                      st.aiCooldown = 35;
                    } else {
                      e.pose = 'uppercut';
                      e.poseTimer = 24;
                      e.poseDuration = 24;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = 50 - st.stageIdx * 6;
                      synthRef.current?.playSfx('heavy');
                    }
                  }
                }
              }
            } else {
              if (e.chillTimer > 0) e.chillTimer--;
            }

            const checkMelee = (att: FighterRuntime, def: FighterRuntime) => {
              if (att.hasHitCurrentAttack) return;
              if (!['punch', 'kick', 'uppercut', 'sweep', 'jump_kick'].includes(att.pose)) return;

              const hasSeq = Boolean(FIGHTER_SPRITE_CONFIG[att.profile.id]?.actionFrames);
              const attProg = att.poseDuration > 0 ? 1 - att.poseTimer / att.poseDuration : 1;
              if (hasSeq && attProg < 0.22) return;

              const reach = att.pose === 'kick' || att.pose === 'sweep' || att.pose === 'jump_kick' ? 88 : 76;
              const dx = (def.x - att.x) * att.facing;
              const dy = Math.abs(def.y - att.y);

              if (dx >= -10 && dx <= reach && dy < 76) {
                if (att.pose === 'punch' && def.isCrouching) return;
                att.hasHitCurrentAttack = true;
                const baseDmg =
                  att.pose === 'uppercut'
                    ? 22
                    : att.pose === 'kick' || att.pose === 'jump_kick'
                    ? 14
                    : att.pose === 'sweep'
                    ? 12
                    : 9;
                const hType =
                  att.pose === 'uppercut'
                    ? 'uppercut'
                    : att.pose === 'sweep'
                    ? 'sweep'
                    : att.pose === 'kick' || att.pose === 'jump_kick'
                    ? 'kick'
                    : 'punch';
                applyHit(att, def, baseDmg, hType);
              }
            };

            checkMelee(p, e);
            checkMelee(e, p);

            if (e.hp <= 0 || (st.timer === 0 && p.hp >= e.hp)) {
              const newPWins = st.pWins + 1;
              st.pWins = newPWins;
              setPlayerWins(newPWins);

              if (newPWins >= 2 && e.hp <= 0) {
                e.pose = 'dizzy';
                e.vx = 0;
                st.phase = 'finish_him';
                st.phaseTimer = 300;
                const bId = bannerIdCounterRef.current++;
                const bObj = {
                  id: bId,
                  text: 'FINISH HIM!',
                  subtext: 'Tekan [F] / FATALITY sekarang!',
                  color: '#ef4444',
                  x: STAGE_W / 2,
                  y: 165,
                  scale: 1.4,
                };
                st.banners.push({ ...bObj, life: 200 });
                st.lastBannerSent = bObj;
                synthRef.current?.playSfx('gong');
              } else {
                e.pose = 'ko';
                st.phase = 'round_end';
                st.phaseTimer = 115;
                p.pose = 'victory';
                scoreRef.current += 500 + p.hp * 5;
                setScore(scoreRef.current);
                const bId = bannerIdCounterRef.current++;
                const bObj = {
                  id: bId,
                  text: `${p.profile.name} WINS!`,
                  subtext: p.hp === p.profile.maxHp ? 'FLAWLESS VICTORY!' : `ROUND ${st.round} CLEAR`,
                  color: '#fbbf24',
                  x: STAGE_W / 2,
                  y: 185,
                  scale: 1.2,
                };
                st.banners.push({ ...bObj, life: 115 });
                st.lastBannerSent = bObj;
                synthRef.current?.playSfx('ko');
              }
            } else if (p.hp <= 0 || (st.timer === 0 && e.hp > p.hp)) {
              const newEWins = st.eWins + 1;
              st.eWins = newEWins;
              setEnemyWins(newEWins);
              if (isOnline && newEWins >= 2 && p.hp <= 0) {
                p.pose = 'dizzy';
                p.vx = 0;
                st.phase = 'finish_him';
                st.phaseTimer = 300;
                const bId = bannerIdCounterRef.current++;
                const bObj = {
                  id: bId,
                  text: 'FINISH HIM!',
                  subtext: 'Lawan siap melakukan FATALITY!',
                  color: '#ef4444',
                  x: STAGE_W / 2,
                  y: 165,
                  scale: 1.4,
                };
                st.banners.push({ ...bObj, life: 200 });
                st.lastBannerSent = bObj;
                synthRef.current?.playSfx('gong');
              } else {
                p.pose = 'ko';
                e.pose = 'victory';
                st.phase = 'round_end';
                st.phaseTimer = 120;
                const bId = bannerIdCounterRef.current++;
                const bObj = {
                  id: bId,
                  text: `${e.profile.name} WINS`,
                  color: '#f43f5e',
                  x: STAGE_W / 2,
                  y: 185,
                  scale: 1.2,
                };
                st.banners.push({ ...bObj, life: 120 });
                st.lastBannerSent = bObj;
                synthRef.current?.playSfx('ko');
              }
            }
          } else if (st.phase === 'finish_him') {
            st.phaseTimer--;
            p.facing = e.x >= p.x ? 1 : -1;
            if (st.phaseTimer <= 0) {
              const pWonRound = e.hp <= p.hp;
              if (pWonRound) {
                e.pose = 'ko';
                p.pose = 'victory';
                scoreRef.current += 600 + p.hp * 5;
                setScore(scoreRef.current);
              } else {
                p.pose = 'ko';
                e.pose = 'victory';
              }
              st.phase = 'round_end';
              st.phaseTimer = 95;
            }
          } else if (st.phase === 'fatality_cinematic') {
            st.phaseTimer--;
            if (st.fatalityCine) {
              st.fatalityCine.frame++;
              const cProg = st.fatalityCine.frame / st.fatalityCine.total;
              const att = st.fatalityCine.attackerSide === 'player' ? p : e;
              const vic = st.fatalityCine.attackerSide === 'player' ? e : p;

              if (cProg < 0.25) {
                att.pose = 'special';
                vic.pose = 'dizzy';
              } else if (cProg < 0.55) {
                att.pose = 'special';
                if (st.fatalityCine.frame === 45) {
                  vic.vy = -8;
                  vic.pose = 'knockdown';
                  st.shake = 22;
                }
                if (st.fatalityCine.frame % 6 === 0) {
                  spawnHitParticles(vic.x, vic.y - 50, '#ef4444', 10);
                  spawnHitParticles(vic.x, vic.y - 50, '#fde047', 6);
                }
              } else {
                att.pose = 'victory';
                vic.pose = 'ko';
              }
            }
            if (st.phaseTimer <= 0) {
              st.fatalityDark = 0;
              st.fatalityCine = null;
              st.phase = 'round_end';
              st.phaseTimer = 25;
              setHudState((prev) => ({
                ...prev,
                fatalityActive: false,
                fatalityVideo: null,
              }));
            }
          } else if (st.phase === 'round_end') {
            st.phaseTimer--;
            if (st.phaseTimer <= 0) {
              if (isOnline) {
                if (st.pWins >= 2 || st.eWins >= 2) {
                  if (!st.onlineFinished && activeMatchIdRef.current) {
                    st.onlineFinished = true;
                    const winnerSide: 'p1' | 'p2' = st.pWins >= 2 ? 'p1' : 'p2';
                    updateDoc(doc(db, 'kombat_matches', activeMatchIdRef.current), {
                      status: 'finished',
                      winnerSide,
                      p1Wins: st.pWins,
                      p2Wins: st.eWins,
                      updatedAt: serverTimestamp(),
                    }).catch(() => {});
                  }
                  return;
                } else {
                  initRound(p.profile.id, st.stageIdx, st.round + 1, st.pWins, st.eWins, {
                    mode: 'online',
                    mySide: 'p1',
                    p2FighterId: e.profile.id,
                    p1Label: st.p1Label,
                    p2Label: st.p2Label,
                    stageId: st.stageId,
                  });
                }
              } else {
                if (st.pWins >= 2) {
                  const nextStage = st.stageIdx + 1;
                  if (nextStage < ARCADE_ENEMIES.length) {
                    setArcadeStageIdx(nextStage);
                    initRound(selectedChar, nextStage, 1, 0, 0);
                  } else {
                    synthRef.current?.stopBgm();
                    saveScoreToDb(scoreRef.current);
                    setScreen('victory');
                    return;
                  }
                } else if (st.eWins >= 2) {
                  synthRef.current?.stopBgm();
                  saveScoreToDb(scoreRef.current);
                  setScreen('gameover');
                  return;
                } else {
                  initRound(selectedChar, st.stageIdx, st.round + 1, st.pWins, st.eWins);
                }
              }
            }
          }
        } else {
          // P2 ONLINE CLIENT LOCAL CINEMATIC ADVANCE
          if (st.phase === 'fatality_cinematic' && st.fatalityCine) {
            st.fatalityCine.frame++;
            const cProg = st.fatalityCine.frame / st.fatalityCine.total;
            const att = st.fatalityCine.attackerSide === 'player' ? p : e;
            const vic = st.fatalityCine.attackerSide === 'player' ? e : p;
            if (cProg < 0.25) {
              att.pose = 'special';
              vic.pose = 'dizzy';
            } else if (cProg < 0.55) {
              att.pose = 'special';
              if (st.fatalityCine.frame === 45) {
                vic.vy = -8;
                vic.pose = 'knockdown';
                st.shake = 22;
              }
              if (st.fatalityCine.frame % 6 === 0) {
                spawnHitParticles(vic.x, vic.y - 50, '#ef4444', 10);
              }
            } else {
              att.pose = 'victory';
              vic.pose = 'ko';
            }
          }
        }

        // Physics & Timers for Both Fighters
        [p, e].forEach((f) => {
          f.x += f.vx;
          f.y += f.vy;
          if (f.y < GROUND_Y) {
            f.vy += GRAVITY;
          } else {
            f.y = GROUND_Y;
            f.vy = 0;
            if (f.pose === 'jump' || f.pose === 'jump_kick') f.pose = 'idle';
          }
          f.x = Math.max(48, Math.min(STAGE_W - 48, f.x));
          if (f.pose === 'hit' || f.pose === 'knockdown') f.vx *= 0.85;

          if (f.poseTimer > 0) {
            f.poseTimer--;
            if (f.poseTimer === 0 && !['ko', 'dizzy', 'victory'].includes(f.pose)) {
              f.pose = 'idle';
            }
          }
          if (f.comboResetTimer > 0) {
            f.comboResetTimer--;
            if (f.comboResetTimer === 0) f.comboCount = 0;
          }
        });

        if (Math.abs(p.x - e.x) < 42 && Math.abs(p.y - e.y) < 50 && p.pose !== 'ko' && e.pose !== 'ko') {
          const push = (42 - Math.abs(p.x - e.x)) * 0.5;
          if (p.x < e.x) {
            p.x -= push;
            e.x += push;
          } else {
            p.x += push;
            e.x -= push;
          }
        }

        st.projectiles = st.projectiles.filter((proj) => {
          proj.x += proj.vx;
          proj.life--;
          const target = proj.owner === 'player' ? e : p;
          const attacker = proj.owner === 'player' ? p : e;

          if (Math.random() < 0.6) {
            st.particles.push({
              x: proj.x,
              y: proj.y,
              vx: -proj.vx * 0.2,
              vy: (Math.random() - 0.5) * 1.5,
              size: 4,
              color: proj.color,
              life: 12,
              maxLife: 12,
            });
          }

          if (!isP2Client) {
            const targetTop = target.isCrouching ? target.y - 54 : target.y - 102;
            if (Math.abs(proj.x - target.x) < 28 && proj.y >= targetTop && proj.y <= target.y - 8) {
              if (proj.chill) target.chillTimer = 180;
              applyHit(attacker, target, proj.damage, 'projectile', Boolean(proj.pull));
              return false;
            }
          }
          return proj.life > 0 && proj.x > 0 && proj.x < STAGE_W;
        });

        st.particles = st.particles.filter((pt) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          if (pt.gravity) pt.vy += pt.gravity;
          pt.life--;
          return pt.life > 0;
        });

        st.banners = st.banners.filter((b) => {
          b.life--;
          return b.life > 0;
        });
      }

      // Firebase Multiplayer State Sync (~11Hz or immediate on attack)
      if (isOnline && activeMatchIdRef.current && !st.onlineFinished) {
        const nowMs = performance.now();
        const hasPendingAttack = Boolean(pendingLocalAttackRef.current);
        if (hasPendingAttack || nowMs - lastNetworkSendMsRef.current >= 95) {
          if (!isP2Client) {
            const syncHash = `${Math.round(st.player.x)}_${Math.round(st.player.y)}_${st.player.pose}_${st.player.hp}_${st.enemy.hp}_${st.phase}_${st.timer}_${st.pWins}_${st.eWins}_${st.projectiles.length}`;
            if (syncHash !== lastSentSnapHashRef.current || st.lastBannerSent) {
              lastSentSnapHashRef.current = syncHash;
              lastNetworkSendMsRef.current = nowMs;
              const payload: Record<string, any> = {
                updatedAt: serverTimestamp(),
                hostSync: {
                  p1: {
                    x: Math.round(st.player.x),
                    y: Math.round(st.player.y),
                    facing: st.player.facing,
                    pose: st.player.pose,
                    poseTimer: st.player.poseTimer,
                    poseDuration: st.player.poseDuration,
                    isBlocking: st.player.isBlocking,
                    isCrouching: st.player.isCrouching,
                    attackNonce: localAttackNonceRef.current,
                    hp: st.player.hp,
                    energy: Math.round(st.player.energy),
                    chillTimer: st.player.chillTimer,
                    comboCount: st.player.comboCount,
                  },
                  p2Hp: st.enemy.hp,
                  p2Energy: Math.round(st.enemy.energy),
                  p2ChillTimer: st.enemy.chillTimer,
                  p2PoseOverride: ['hit', 'knockdown', 'ko', 'dizzy', 'victory'].includes(st.enemy.pose)
                    ? st.enemy.pose
                    : null,
                  p2PoseTimer: st.enemy.poseTimer,
                  timer: st.timer,
                  phase: st.phase,
                  phaseTimer: st.phaseTimer,
                  round: st.round,
                  p1Wins: st.pWins,
                  p2Wins: st.eWins,
                  fatalityAttacker: st.fatalityCine?.attackerSide || null,
                  fatalityVariantId: st.fatalityCine?.variantId || null,
                  fatalityVariantName: st.fatalityCine?.fatalityName || null,
                  projectiles: st.projectiles.slice(0, 6).map((pr) => ({
                    owner: pr.owner,
                    originX: Math.round(pr.originX),
                    x: Math.round(pr.x),
                    y: Math.round(pr.y),
                    vx: pr.vx,
                    type: pr.type,
                    color: pr.color,
                    core: pr.core,
                    damage: pr.damage,
                    life: pr.life,
                  })),
                  bannerEvent: st.lastBannerSent || null,
                  seq: hostSeqCounterRef.current++,
                },
              };
              st.lastBannerSent = undefined;
              updateDoc(doc(db, 'kombat_matches', activeMatchIdRef.current), payload).catch(() => {});
            }
          } else {
            const p2SnapHash = `${Math.round(st.enemy.x)}_${Math.round(st.enemy.y)}_${st.enemy.pose}_${st.enemy.isBlocking}_${localAttackNonceRef.current}`;
            if (hasPendingAttack || p2SnapHash !== lastSentSnapHashRef.current) {
              lastSentSnapHashRef.current = p2SnapHash;
              lastNetworkSendMsRef.current = nowMs;
              const act = pendingLocalAttackRef.current;
              pendingLocalAttackRef.current = undefined;
              updateDoc(doc(db, 'kombat_matches', activeMatchIdRef.current), {
                updatedAt: serverTimestamp(),
                p2Snap: {
                  x: Math.round(st.enemy.x),
                  y: Math.round(st.enemy.y),
                  facing: st.enemy.facing,
                  pose: st.enemy.pose,
                  poseTimer: st.enemy.poseTimer,
                  poseDuration: st.enemy.poseDuration,
                  isBlocking: st.enemy.isBlocking,
                  isCrouching: st.enemy.isCrouching,
                  attackNonce: localAttackNonceRef.current,
                  attackAction: act || null,
                },
              }).catch(() => {});
            }
          }
        }
      }

      // RENDER ARENA & HUD
      ctx.save();
      if (st.shake > 0) {
        ctx.translate((Math.random() - 0.5) * st.shake * 2, (Math.random() - 0.5) * st.shake * 2);
      }

      drawArenaBackground(ctx, st.stageId, time, st.fatalityDark);
      drawHumanFighter(ctx, st.enemy, time);
      drawHumanFighter(ctx, st.player, time);

      st.projectiles.forEach((proj) => drawProjectile(ctx, proj, time));

      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

      // Dramatic Fatality Overlay / Finish Him Target Prompt
      drawFatalityOverlay(st, time);

      // Arcade Top HUD
      const barW = 310;
      const barH = 22;

      ctx.fillStyle = '#111827';
      ctx.fillRect(28, 22, barW + 4, barH + 4);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 22, barW + 4, barH + 4);

      const pRatio = Math.max(0, st.player.hp / st.player.profile.maxHp);
      const pTrailRatio = Math.max(0, st.player.trailHp / st.player.profile.maxHp);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(30, 24, barW * pTrailRatio, barH);
      const pGrad = ctx.createLinearGradient(0, 24, 0, 24 + barH);
      pGrad.addColorStop(0, '#4ade80');
      pGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = pGrad;
      ctx.fillRect(30, 24, barW * pRatio, barH);

      const eBarX = STAGE_W - 28 - barW - 4;
      ctx.fillStyle = '#111827';
      ctx.fillRect(eBarX, 22, barW + 4, barH + 4);
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(eBarX, 22, barW + 4, barH + 4);

      const eRatio = Math.max(0, st.enemy.hp / st.enemy.profile.maxHp);
      const eTrailRatio = Math.max(0, st.enemy.trailHp / st.enemy.profile.maxHp);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(eBarX + 2 + barW * (1 - eTrailRatio), 24, barW * eTrailRatio, barH);
      const eGrad = ctx.createLinearGradient(0, 24, 0, 24 + barH);
      eGrad.addColorStop(0, '#4ade80');
      eGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = eGrad;
      ctx.fillRect(eBarX + 2 + barW * (1 - eRatio), 24, barW * eRatio, barH);

      ctx.font = '900 13px monospace';
      ctx.fillStyle = st.mySide === 'p1' ? '#fde047' : '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(
        isOnline ? `${st.p1Label} (${st.player.profile.name})` : st.player.profile.name,
        30,
        62
      );
      ctx.fillStyle = st.mySide === 'p2' && isOnline ? '#fde047' : '#cbd5e1';
      ctx.textAlign = 'right';
      ctx.fillText(
        isOnline ? `${st.p2Label} (${st.enemy.profile.name})` : st.enemy.profile.name,
        STAGE_W - 30,
        62
      );

      for (let i = 0; i < 2; i++) {
        ctx.fillStyle = i < st.pWins ? '#f59e0b' : 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(36 + i * 18, 76, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = i < st.eWins ? '#ef4444' : 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(STAGE_W - 36 - i * 18, 76, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#09090b';
      ctx.fillRect(STAGE_W / 2 - 28, 16, 56, 36);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(STAGE_W / 2 - 28, 16, 56, 36);
      ctx.font = '900 24px monospace';
      ctx.fillStyle = st.timer <= 15 ? '#ef4444' : '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(String(st.timer).padStart(2, '0'), STAGE_W / 2, 43);

      // Local Fighter Energy Bar (Bottom-Left)
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(28, STAGE_H - 28, 220, 14);
      ctx.strokeStyle = localFighter.energy >= 100 ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, STAGE_H - 28, 220, 14);
      ctx.fillStyle = localFighter.energy >= 100 ? '#ef4444' : localFighter.energy >= 30 ? '#f59e0b' : '#0ea5e9';
      ctx.fillRect(30, STAGE_H - 26, 216 * (localFighter.energy / 100), 10);
      ctx.font = '800 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(
        localFighter.energy >= 100
          ? 'FATALITY READY! [F]'
          : localFighter.energy >= 30
          ? 'JURUS READY [D]'
          : `ENERGY ${Math.floor(localFighter.energy)}%`,
        34,
        STAGE_H - 18
      );

      st.banners.forEach((b) => {
        ctx.save();
        ctx.translate(b.x, b.y);
        const sc = b.scale || 1;
        ctx.scale(sc, sc);
        ctx.textAlign = 'center';
        ctx.font = '900 32px Impact, sans-serif';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(b.text, 0, 0);
        ctx.fillStyle = b.color;
        ctx.fillText(b.text, 0, 0);
        if (b.subtext) {
          ctx.font = '800 12px monospace';
          ctx.lineWidth = 3;
          ctx.strokeText(b.subtext, 0, 22);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(b.subtext, 0, 22);
        }
        ctx.restore();
      });

      ctx.restore();

      hudSyncCounter++;
      if (hudSyncCounter % 6 === 0) {
        setHudState((prev) => ({
          pHp: localFighter.hp,
          pMax: localFighter.profile.maxHp,
          pEnergy: localFighter.energy,
          eHp: (isP2Client ? st.player : st.enemy).hp,
          eMax: (isP2Client ? st.player : st.enemy).profile.maxHp,
          timer: st.timer,
          finishHim: st.phase === 'finish_him',
          combo: localFighter.comboCount,
          fatalityActive: st.phase === 'fatality_cinematic',
          fatalityVideo: st.phase === 'fatality_cinematic' ? prev.fatalityVideo : null,
        }));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [screen, selectedChar, initRound, saveScoreToDb]);

  const holdKey = (key: string, down: boolean) => {
    keysRef.current[key] = down;
  };

  const selectedProfile = FIGHTERS[selectedChar];

  const stepSelectChar = (dir: -1 | 1) => {
    const idx = PLAYABLE_IDS.indexOf(selectedChar);
    const next = PLAYABLE_IDS[(idx + dir + PLAYABLE_IDS.length) % PLAYABLE_IDS.length];
    setSelectedChar(next);
    synthRef.current?.playSfx('select');
    requestAnimationFrame(() => {
      charCardRefs.current[next]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  };

  return (
    <div
      className={cn(
        'w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden relative',
        screen === 'arena' ? '' : 'rounded-2xl border border-red-900/40'
      )}
    >
      <div
        className={cn(
          'w-full flex items-center justify-between bg-slate-900/95 border-b border-red-900/50 shrink-0',
          screen === 'arena' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              synthRef.current?.stopBgm();
              leaveOnlineMatch(true);
              onExit();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-extrabold transition-all shrink-0"
          >
            <ArrowLeft size={14} /> <span className="hidden xs:inline">Kembali</span>
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 hidden sm:inline truncate">
            {screen === 'arena'
              ? playMode === 'online'
                ? `ONLINE · ROOM ${activeMatchDoc?.roomCode || ''} · ROUND ${roundNum}`
                : `STAGE ${arcadeStageIdx + 1}/3 · ${(arcadeStageIdx === 0 ? ARENAS.find((a) => a.id === selectedStage)?.name : ARCADE_ENEMIES[arcadeStageIdx]?.stageName) || ''} · R${roundNum}`
              : 'Informatika Kombat · 16-Bit SNES'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {screen === 'arena' && (
            <span className="text-[11px] font-black text-amber-300 sm:hidden">
              R{roundNum} · {playerWins}-{enemyWins}
            </span>
          )}
          {playMode === 'online' && screen === 'arena' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black">
              <Wifi size={12} /> <span className="hidden sm:inline">LIVE</span>
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-black text-amber-400 tabular-nums">
            <Trophy size={13} /> {score}
          </div>
          {screen === 'arena' && (
            <button
              onClick={() => setShowTouchPad((v) => !v)}
              className={cn(
                'p-1.5 rounded-lg transition-colors border',
                showTouchPad
                  ? 'bg-amber-500/25 border-amber-400/50 text-amber-300'
                  : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-300'
              )}
              title={showTouchPad ? 'Sembunyikan Tombol Sentuh di Layar' : 'Tampilkan Tombol Sentuh di Layar'}
            >
              <Gamepad2 size={15} />
            </button>
          )}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 w-full min-h-0 flex flex-col items-center',
          screen === 'arena'
            ? 'justify-center p-0 overflow-hidden bg-black'
            : 'justify-center p-2 md:p-4 overflow-y-auto custom-scrollbar'
        )}
      >
        {screen === 'title' && (
          <div className="max-w-4xl w-full relative overflow-hidden rounded-3xl border-2 border-amber-500/50 shadow-2xl bg-[radial-gradient(ellipse_at_center,_#450a0a_0%,_#180614_50%,_#020617_100%)]">
            <div className="relative w-full aspect-[16/9] min-h-[340px] flex flex-col items-center justify-end p-5 md:p-8 text-center">
              <img
                src={menuBannerUrl}
                alt="Informatika Kombat"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                onLoad={() => setBannerReady(true)}
                onError={() => setBannerReady(true)}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-200',
                  bannerReady ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/65 to-black/35" />

              <div className="relative z-10 max-w-2xl space-y-3.5">
                <div className="inline-flex items-center gap-2 text-[11px] md:text-xs font-black uppercase tracking-[0.25em] text-amber-300 bg-black/60 border border-amber-500/40 px-3.5 py-1 rounded-full">
                  <Flame size={15} className="text-red-500" /> 16-BIT ARCADE &amp; ONLINE MULTIPLAYER
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-500 to-red-600 drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                  INFORMATIKA KOMBAT
                </h1>
                <p className="text-xs md:text-sm text-slate-200 font-medium drop-shadow">
                  9 Arena Bertarung Ikonik · Jurus Elemen &amp; <b>FATALITY Video AI</b> Tiap Petarung · Duel <b>Online Real-Time</b> Firebase!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      ensureArenaBackgroundsLoaded();
                      ensureFighterSpritesLoaded();
                      setPlayMode('arcade');
                      synthRef.current?.playSfx('gong');
                      setScreen('select');
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base rounded-2xl shadow-xl shadow-red-600/35 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Swords size={20} /> SOLO ARCADE
                  </button>
                  <button
                    onClick={() => {
                      ensureArenaBackgroundsLoaded();
                      ensureFighterSpritesLoaded();
                      setPlayMode('online');
                      setMatchStatus('idle');
                      setMatchError(null);
                      synthRef.current?.playSfx('gong');
                      setScreen('select');
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Globe size={20} /> MULTIPLAYER ONLINE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'select' && (
          <div className="max-w-5xl w-full space-y-3">
            {/* Mode Switch Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-tight">
                  Pilih Pejuang &amp; Arena
                </h2>
                <p className="text-xs text-slate-400 font-semibold">
                  Gunakan <b className="text-amber-300">[←] [→]</b> untuk memilih karakter, pilih salah satu dari 9 arena, lalu tekan <b className="text-amber-300">[ENTER]</b>!
                </p>
              </div>
              <div className="inline-flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1 shrink-0">
                <button
                  onClick={() => {
                    if (matchStatus === 'waiting') cancelMatchmaking();
                    setPlayMode('arcade');
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                    playMode === 'arcade' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Swords size={14} /> Solo Arcade
                </button>
                <button
                  onClick={() => {
                    setPlayMode('online');
                    setMatchError(null);
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                    playMode === 'online' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Users size={14} /> Multiplayer Online
                </button>
              </div>
            </div>

            {spriteProgress.total > 0 && spriteProgress.loaded < spriteProgress.total && (
              <p className="text-[11px] font-bold text-amber-300 text-center">
                Menyiapkan sprite HD... {spriteProgress.loaded}/{spriteProgress.total}
              </p>
            )}

            {/* Single Horizontal Side-by-Side KTP-Portrait Strip */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepSelectChar(-1)}
                className="w-10 h-28 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 active:scale-95 transition-all"
                title="Karakter Sebelumnya (←)"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex-1 flex flex-nowrap items-stretch gap-2.5 overflow-x-auto py-1.5 px-1 custom-scrollbar scroll-smooth">
                {PLAYABLE_IDS.map((fid) => {
                  const f = FIGHTERS[fid];
                  const isSel = selectedChar === fid;
                  return (
                    <div
                      key={fid}
                      ref={(el) => {
                        charCardRefs.current[fid] = el;
                      }}
                      onClick={() => {
                        setSelectedChar(fid);
                        synthRef.current?.playSfx('select');
                      }}
                      className={cn(
                        'w-28 shrink-0 cursor-pointer rounded-2xl p-2 border-2 transition-all flex flex-col items-center text-center bg-slate-900/95',
                        isSel
                          ? 'border-amber-400 shadow-lg shadow-amber-500/30 scale-[1.04] bg-gradient-to-b from-slate-800 to-slate-900'
                          : 'border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
                      )}
                    >
                      <FighterPortrait id={fid} active={isSel} variant="bust" />
                      <h3 className="text-[11px] font-black text-white mt-1.5 truncate w-full">{f.name}</h3>
                      <span className="text-[9px] font-bold text-amber-400 truncate w-full">{f.specialName}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => stepSelectChar(1)}
                className="w-10 h-28 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 active:scale-95 transition-all"
                title="Karakter Berikutnya (→)"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Highlighted Fighter Full-Body Front Spotlight Panel */}
            <div className="bg-slate-900/95 border border-amber-500/35 rounded-2xl p-3.5 flex flex-col md:flex-row items-center gap-4">
              <div className="shrink-0 bg-slate-950/90 border border-amber-500/30 rounded-2xl p-2">
                <FighterPortrait id={selectedChar} active={true} variant="front" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h3 className="text-xl font-black text-white">{selectedProfile.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {selectedProfile.codename}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{selectedProfile.specialDesc}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px] font-bold text-slate-400 pt-1">
                  <span className="text-emerald-400">HP: {selectedProfile.maxHp}</span>
                  <span className="text-sky-400">Speed: {selectedProfile.speed.toFixed(1)}</span>
                  <span className="text-orange-400">Power: {Math.round(selectedProfile.power * 100)}%</span>
                  <span className="text-rose-400">Fatality: {selectedProfile.fatalityName}</span>
                </div>
              </div>
              {playMode === 'arcade' && (
                <button
                  onClick={() => startArcade(selectedChar)}
                  className="px-7 py-3.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black rounded-xl shadow-lg shrink-0 active:scale-95 transition-all"
                >
                  MULAI BERTARUNG! [ENTER]
                </button>
              )}
            </div>

            {/* 9-Arena Background Picker */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-wider text-amber-400">
                  Pilih Arena Pertarungan ({selectedStage}/9 · {ARENAS.find((a) => a.id === selectedStage)?.name})
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {ARENAS.find((a) => a.id === selectedStage)?.theme}
                </span>
              </div>
              <div className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {ARENAS.map((arena) => {
                  const isArenaSel = selectedStage === arena.id;
                  return (
                    <button
                      key={arena.id}
                      type="button"
                      onClick={() => {
                        setSelectedStage(arena.id);
                        synthRef.current?.playSfx('select');
                      }}
                      className={cn(
                        'w-28 shrink-0 rounded-xl overflow-hidden border-2 text-left transition-all bg-slate-950',
                        isArenaSel
                          ? 'border-amber-400 shadow-md shadow-amber-500/30 scale-[1.03]'
                          : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                      )}
                    >
                      <img
                        src={arena.url}
                        alt={arena.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-14 object-cover block"
                      />
                      <div className="px-1.5 py-1">
                        <p className="text-[10px] font-black text-white truncate">{arena.name}</p>
                        <p className="text-[9px] font-semibold text-amber-300/90 truncate">{arena.theme}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Online Multiplayer Firebase Matchmaking Panel */}
            {playMode === 'online' && (
              <div className="bg-slate-900/95 border border-emerald-500/35 rounded-2xl p-4 space-y-3">
                {matchStatus === 'waiting' && activeMatchDoc ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                        <Loader2 size={22} className="animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-300">
                          {activeMatchDoc.isPublic
                            ? 'Mencari Lawan Otomatis di Server Firebase...'
                            : 'Menunggu Teman Bergabung ke Room...'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">Kode Room:</span>
                          <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-amber-400/50 text-amber-300 font-black tracking-widest text-sm">
                            {activeMatchDoc.roomCode}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(activeMatchDoc.roomCode);
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 1500);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Salin Kode Room"
                          >
                            {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={cancelMatchmaking}
                      className="px-5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black shrink-0"
                    >
                      Batalkan Pencarian
                    </button>
                  </div>
                ) : matchStatus === 'matched' ? (
                  <div className="flex items-center justify-center gap-3 py-3 text-emerald-300 font-black text-base">
                    <Flame className="text-amber-400 animate-bounce" size={22} />
                    LAWAN DITEMUKAN! MEMASUKI ARENA...
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-xs font-bold text-slate-400 shrink-0">Nama Petarung:</label>
                        <input
                          type="text"
                          value={playerName}
                          maxLength={40}
                          onChange={(e) => setPlayerName(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 w-full max-w-xs"
                          placeholder="Nama kamu..."
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => startQuickMatchmaking(selectedChar)}
                          disabled={matchStatus === 'searching'}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                        >
                          {matchStatus === 'searching' ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Globe size={14} />
                          )}
                          CARI LAWAN OTOMATIS [ENTER]
                        </button>
                        <button
                          onClick={() => createPrivateRoom(selectedChar)}
                          disabled={matchStatus === 'searching'}
                          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black active:scale-95 transition-all"
                        >
                          Buat Room Teman
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={joinCodeInput}
                          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                          maxLength={8}
                          placeholder="Masukkan Kode Room (mis. MK7X2A)"
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black tracking-wider text-amber-300 placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:border-amber-400 w-56"
                        />
                        <button
                          onClick={() => joinRoomByCode(selectedChar)}
                          disabled={matchStatus === 'searching'}
                          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black text-white"
                        >
                          Gabung Kode
                        </button>
                      </div>
                      {matchError && <p className="text-xs font-bold text-rose-400">{matchError}</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span className="font-black text-amber-300 uppercase">Kontrol Arena:</span>
              <span>
                <b>← / →</b> = Jalan · <b>↑</b> = Lompat · <b>↓</b> = Jongkok · <b>A</b> = Pukul · <b>S</b> = Tendang · <b>W / ↓+A</b> = Uppercut · <b>↓+S</b> = Sapu · <b>D</b> = Jurus · <b>Spasi</b> = Block · <b>F</b> = Fatality
              </span>
            </div>
          </div>
        )}

        {screen === 'arena' && (
          <div className="relative w-full h-full flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
            {/* Subtle blurred ambient stage backdrop for non-16:9 aspect screens */}
            <img
              src={
                ARENAS.find(
                  (a) => a.id === (engineRef.current?.stageId || activeMatchDoc?.stage || selectedStage)
                )?.url || ARENAS[0].url
              }
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md scale-105 pointer-events-none"
            />

            {/* Full-Viewport Responsive Arena Canvas */}
            <canvas
              ref={canvasRef}
              width={STAGE_W}
              height={STAGE_H}
              className="relative z-10 w-full h-full object-contain block select-none"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* AI Video Fatality Overlay (Zero Vector Graphics) */}
            {hudState.fatalityVideo && (
              <div className="absolute inset-0 z-20 bg-black/95 flex items-center justify-center pointer-events-none">
                <video
                  key={hudState.fatalityVideo.key}
                  src={hudState.fatalityVideo.videoUrl}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-x-0 bottom-[8%] flex flex-col items-center justify-center px-4 text-center bg-gradient-to-t from-black/85 via-black/45 to-transparent py-3">
                  <div className="text-4xl sm:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-red-500 to-rose-900 drop-shadow-[0_4px_18px_rgba(220,38,38,0.95)]">
                    FATALITY!!
                  </div>
                  <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-200 drop-shadow mt-1">
                    {hudState.fatalityVideo.attackerName} WINS · {hudState.fatalityVideo.fatalityName} · +1500 BONUS
                  </div>
                </div>
              </div>
            )}

            {/* In-Arena Floating Translucent Touch Controls (Rendered ONLY on touchscreens or when toggled on) */}
            {showTouchPad && !hudState.fatalityActive && (
              <div className="absolute inset-x-0 bottom-0 z-30 p-2 sm:p-4 flex items-end justify-between gap-2 pointer-events-none">
                {/* Bottom-Left: Virtual D-Pad INSIDE Arena */}
                <div className="pointer-events-auto touch-none flex items-center gap-1.5 bg-slate-950/45 backdrop-blur-sm border border-white/15 rounded-2xl p-1.5 shadow-xl">
                  <button
                    onPointerDown={(e) => { e.preventDefault(); holdKey('arrowleft', true); }}
                    onPointerUp={() => holdKey('arrowleft', false)}
                    onPointerLeave={() => holdKey('arrowleft', false)}
                    onPointerCancel={() => holdKey('arrowleft', false)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/70 active:bg-amber-500/85 border border-white/20 flex items-center justify-center font-black text-white shadow"
                    title="Mundur / Kiri"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('jump'); }}
                      className="w-11 h-8 sm:w-12 sm:h-9 rounded-lg bg-slate-900/70 active:bg-amber-500/85 border border-white/20 flex items-center justify-center font-black text-white shadow"
                      title="Lompat"
                    >
                      <ChevronUp size={17} />
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); holdKey('arrowdown', true); }}
                      onPointerUp={() => holdKey('arrowdown', false)}
                      onPointerLeave={() => holdKey('arrowdown', false)}
                      onPointerCancel={() => holdKey('arrowdown', false)}
                      className="w-11 h-8 sm:w-12 sm:h-9 rounded-lg bg-slate-900/70 active:bg-amber-500/85 border border-white/20 flex items-center justify-center font-black text-white shadow"
                      title="Jongkok"
                    >
                      <ChevronDown size={17} />
                    </button>
                  </div>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); holdKey('arrowright', true); }}
                    onPointerUp={() => holdKey('arrowright', false)}
                    onPointerLeave={() => holdKey('arrowright', false)}
                    onPointerCancel={() => holdKey('arrowright', false)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/70 active:bg-amber-500/85 border border-white/20 flex items-center justify-center font-black text-white shadow"
                    title="Maju / Kanan"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                {/* Bottom-Right: Virtual Action Cluster INSIDE Arena */}
                <div className="pointer-events-auto touch-none flex flex-col items-end gap-1.5 bg-slate-950/45 backdrop-blur-sm border border-white/15 rounded-2xl p-1.5 shadow-xl">
                  <div className="flex items-center gap-1.5">
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('uppercut'); }}
                      className="px-2.5 py-2 rounded-xl bg-orange-600/75 active:bg-orange-500 border border-white/20 text-[11px] font-black text-white shadow"
                    >
                      UPPER
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('special'); }}
                      disabled={hudState.pEnergy < 30}
                      className={cn(
                        'px-2.5 py-2 rounded-xl border text-[11px] font-black flex items-center gap-1 shadow transition-all',
                        hudState.pEnergy >= 30
                          ? 'bg-purple-600/80 active:bg-purple-500 border-purple-300/40 text-white'
                          : 'bg-slate-900/50 border-white/10 text-slate-400 opacity-60'
                      )}
                    >
                      <Zap size={13} /> JURUS
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('fatality'); }}
                      disabled={!hudState.finishHim && hudState.pEnergy < 100}
                      className={cn(
                        'px-2.5 py-2 rounded-xl border text-[11px] font-black flex items-center gap-1 shadow transition-all',
                        hudState.finishHim || hudState.pEnergy >= 100
                          ? 'bg-gradient-to-r from-red-600 to-rose-500 border-amber-300 text-white animate-pulse ring-2 ring-amber-300'
                          : 'bg-slate-900/50 border-white/10 text-slate-400 opacity-60'
                      )}
                    >
                      <Flame size={13} /> FATAL
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onPointerDown={(e) => { e.preventDefault(); holdKey(' ', true); }}
                      onPointerUp={() => holdKey(' ', false)}
                      onPointerLeave={() => holdKey(' ', false)}
                      onPointerCancel={() => holdKey(' ', false)}
                      className="px-2.5 py-2 rounded-xl bg-sky-600/75 active:bg-sky-500 border border-white/20 text-[11px] font-black text-white flex items-center gap-1 shadow"
                    >
                      <Shield size={13} /> BLOCK
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('sweep'); }}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600/75 active:bg-emerald-500 border border-white/20 text-[11px] font-black text-white shadow"
                    >
                      SAPU
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('punch'); }}
                      className="px-3 py-2 rounded-xl bg-blue-600/80 active:bg-blue-500 border border-white/20 text-[11px] font-black text-white shadow"
                    >
                      PUKUL
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); triggerAction('kick'); }}
                      className="px-3 py-2 rounded-xl bg-amber-600/80 active:bg-amber-500 border border-white/20 text-[11px] font-black text-white shadow"
                    >
                      TENDANG
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'victory' && (
          <div className="max-w-md w-full bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/40">
              <Trophy size={34} />
            </div>
            <h2 className="text-3xl font-black text-amber-400">
              {onlineOutcomeMsg ? 'VICTORY ONLINE!' : 'CHAMPION OF KOMBAT!'}
            </h2>
            <p className="text-sm text-slate-300">
              {onlineOutcomeMsg || 'Luar biasa! Kamu berhasil menaklukkan seluruh 3 stage termasuk Shao Trojan!'}
            </p>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Skor</p>
              <p className="text-4xl font-black text-amber-400 tabular-nums mt-1">{score} Poin</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMatchStatus('idle');
                  setScreen('select');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-500 font-black rounded-xl text-sm"
              >
                Main Lagi
              </button>
              <button
                onClick={() => {
                  leaveOnlineMatch(false);
                  onExit();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-sm"
              >
                Keluar
              </button>
            </div>
          </div>
        )}

        {screen === 'gameover' && (
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <RotateCcw size={32} />
            </div>
            <h2 className="text-3xl font-black text-rose-500">KALAH DI ARENA</h2>
            <p className="text-sm text-slate-300">
              {onlineOutcomeMsg ||
                `Kamu mencapai Stage ${arcadeStageIdx + 1} dengan total skor ${score} poin. Coba lagi dan gunakan kombinasi Block + Uppercut!`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMatchStatus('idle');
                  if (playMode === 'online') {
                    setScreen('select');
                  } else {
                    startArcade(selectedChar);
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 font-black rounded-xl text-sm"
              >
                {playMode === 'online' ? 'Cari Lawan Lagi' : 'Coba Lagi'}
              </button>
              <button
                onClick={() => {
                  setMatchStatus('idle');
                  setScreen('select');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-sm"
              >
                Ganti Karakter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
