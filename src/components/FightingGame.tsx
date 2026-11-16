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
} from 'lucide-react';
import { cn } from '../utils';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface FightingGameProps {
  currentStudent?: any;
  isAdmin?: boolean;
  onExit: () => void;
  onFirestoreError?: (err: unknown, op: string, path: string) => void;
}

type FighterId = 'scorpio' | 'subbyte' | 'shaolin' | 'raiden' | 'crimson' | 'reptile' | 'shao' | 'red_ranger' | 'kamen_rider';
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
};

const PLAYABLE_IDS: FighterId[] = ['scorpio', 'subbyte', 'shaolin', 'raiden', 'red_ranger', 'kamen_rider'];
const ARCADE_ENEMIES: { fighter: FighterId; stage: 1 | 2 | 3; stageName: string }[] = [
  { fighter: 'crimson', stage: 1, stageName: 'KUIL MALAM (THE COURTYARD)' },
  { fighter: 'reptile', stage: 2, stageName: 'JEMBATAN JURANG (THE PIT)' },
  { fighter: 'shao', stage: 3, stageName: 'TAKHTA KAISAR TROJAN' },
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
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.72);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.76);
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

// High-Detail Iconic SNES Mortal Kombat Fighter Renderer
function drawHumanFighter(
  ctx: CanvasRenderingContext2D,
  f: FighterRuntime,
  time: number,
  isPortrait = false
) {
  const p = f.profile;
  const sc = p.scale || 1;

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

  ctx.scale(f.facing * sc, sc);

  // Ambient aura effects (Sub-Zero frost, Raiden electricity, Cryo chilled)
  if (f.chillTimer > 0) {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
  }

  // KO / Knockdown horizontal rotation
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
    fElbowX = sway + 16;
    fElbowY = torsoY - 12;
    fHandX = sway + 18;
    fHandY = torsoY - 44;
  } else if (f.pose === 'hit') {
    fElbowX = sway - 12;
    fElbowY = torsoY + 20;
    fHandX = sway - 18;
    fHandY = torsoY + 6;
  }

  drawTaperedMuscle(ctx, sway + 5, torsoY + 7, fElbowX, fElbowY, 7.5, 5.8, armBase, armHi, armSh);
  drawTaperedMuscle(ctx, fElbowX, fElbowY, fHandX, fHandY, 5.8, 4.8, armBase, armHi, armSh);
  drawFist(fHandX, fHandY);

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

// Draw authentic SNES Mortal Kombat Arena Background
function drawArenaBackground(ctx: CanvasRenderingContext2D, stage: 1 | 2 | 3, time: number, fatalityDarkness: number) {
  if (stage === 1) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#070b1e');
    sky.addColorStop(0.55, '#171c3a');
    sky.addColorStop(1, '#2d1e38');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, STAGE_W, GROUND_Y);

    ctx.fillStyle = '#fef3c7';
    ctx.shadowColor = '#fde68a';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(620, 92, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f1224';
    ctx.beginPath();
    ctx.moveTo(60, 260);
    ctx.lineTo(220, 260);
    ctx.lineTo(140, 200);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(90, 260, 100, 122);

    ctx.beginPath();
    ctx.moveTo(560, 250);
    ctx.lineTo(740, 250);
    ctx.lineTo(650, 185);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(590, 250, 120, 132);

    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 315, STAGE_W, 67);
    [85, 290, 510, 715].forEach((px) => {
      ctx.fillStyle = '#2e2942';
      ctx.fillRect(px - 18, 120, 36, 262);
      ctx.fillStyle = '#474063';
      ctx.fillRect(px - 22, 112, 44, 14);
      ctx.fillRect(px - 22, 368, 44, 14);
    });

    [160, 220, 360, 440, 590, 640].forEach((mx, idx) => {
      const cheer = Math.abs(Math.sin(time * 0.006 + idx)) * 6;
      ctx.fillStyle = '#090b14';
      ctx.beginPath();
      ctx.arc(mx, 336 - cheer, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(mx - 10, 345 - cheer, 20, 36);
    });

    [195, 605].forEach((bx) => {
      ctx.fillStyle = '#44403c';
      ctx.fillRect(bx - 14, 345, 28, 37);
      const flick = Math.sin(time * 0.03 + bx) * 5;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(bx - 12, 345);
      ctx.lineTo(bx + flick, 310 - Math.abs(flick));
      ctx.lineTo(bx + 12, 345);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(bx - 6, 345);
      ctx.lineTo(bx + flick * 0.5, 323);
      ctx.lineTo(bx + 6, 345);
      ctx.fill();
    });
  } else if (stage === 2) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#041219');
    sky.addColorStop(0.6, '#0b2936');
    sky.addColorStop(1, '#123d33');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, STAGE_W, GROUND_Y);

    ctx.fillStyle = '#d1fae5';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(400, 120, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#071d24';
    ctx.beginPath();
    ctx.moveTo(0, 382);
    ctx.lineTo(140, 210);
    ctx.lineTo(290, 310);
    ctx.lineTo(430, 230);
    ctx.lineTo(590, 320);
    ctx.lineTo(740, 195);
    ctx.lineTo(800, 270);
    ctx.lineTo(800, 382);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 345, STAGE_W, 37);
    for (let x = 40; x < STAGE_W; x += 120) {
      ctx.fillStyle = '#374151';
      ctx.fillRect(x - 10, 310, 20, 72);
      const f = Math.sin(time * 0.025 + x) * 4;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(x - 8, 310);
      ctx.lineTo(x + f, 282);
      ctx.lineTo(x + 8, 310);
      ctx.fill();
    }
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#1a0408');
    sky.addColorStop(0.55, '#3b0912');
    sky.addColorStop(1, '#581217');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, STAGE_W, GROUND_Y);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(400, 185, 92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
    ctx.beginPath();
    ctx.arc(400, 185, 76, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22060b';
    ctx.fillRect(350, 210, 100, 172);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(365, 225, 70, 140);

    [90, 710].forEach((px) => {
      ctx.fillStyle = '#291518';
      ctx.fillRect(px - 22, 60, 44, 322);
      ctx.fillStyle = '#f59e0b';
      const fl = Math.sin(time * 0.035 + px) * 5;
      ctx.beginPath();
      ctx.moveTo(px - 14, 245);
      ctx.lineTo(px + fl, 200);
      ctx.lineTo(px + 14, 245);
      ctx.fill();
    });
  }

  const floorGrad = ctx.createLinearGradient(0, GROUND_Y, 0, STAGE_H);
  floorGrad.addColorStop(0, stage === 3 ? '#3b1518' : '#2c2938');
  floorGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, GROUND_Y, STAGE_W, STAGE_H - GROUND_Y);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(STAGE_W, GROUND_Y);
  ctx.stroke();

  for (let i = -6; i <= 6; i++) {
    const topX = STAGE_W / 2 + i * 70;
    const botX = STAGE_W / 2 + i * 115;
    ctx.beginPath();
    ctx.moveTo(topX, GROUND_Y);
    ctx.lineTo(botX, STAGE_H);
    ctx.stroke();
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

// Portrait Preview Component for Character Select
function FighterPortrait({ id, active }: { id: FighterId; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const render = (t: number) => {
      ctx.clearRect(0, 0, 140, 140);
      // Dramatic radial rim spotlight behind fighter
      const bg = ctx.createRadialGradient(70, 65, 8, 70, 70, 66);
      bg.addColorStop(0, active ? 'rgba(245, 158, 11, 0.35)' : 'rgba(51, 65, 85, 0.3)');
      bg.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 140, 140);

      const dummy: FighterRuntime = {
        profile: FIGHTERS[id],
        x: 70,
        y: 126,
        vx: 0,
        vy: 0,
        facing: 1,
        hp: 100,
        trailHp: 100,
        energy: 0,
        pose: active ? 'victory' : 'idle',
        poseTimer: 0,
        poseDuration: 0,
        hasHitCurrentAttack: false,
        isBlocking: false,
        isCrouching: false,
        chillTimer: 0,
        comboCount: 0,
        comboResetTimer: 0,
        walkPhase: 0,
      };
      drawHumanFighter(ctx, dummy, t, true);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [id, active]);

  return <canvas ref={canvasRef} width={140} height={140} className="w-28 h-28 mx-auto" />;
}

export default function FightingGame({ currentStudent, isAdmin, onExit, onFirestoreError }: FightingGameProps) {
  const [screen, setScreen] = useState<'title' | 'select' | 'arena' | 'victory' | 'gameover'>('title');
  const [selectedChar, setSelectedChar] = useState<FighterId>('scorpio');
  const [arcadeStageIdx, setArcadeStageIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [hudState, setHudState] = useState({
    pHp: 100,
    pMax: 100,
    pEnergy: 0,
    eHp: 100,
    eMax: 100,
    timer: 99,
    finishHim: false,
    combo: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<MkAudioSynth | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const scoreRef = useRef(0);
  const isSavingRef = useRef(false);

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
    pWins: number;
    eWins: number;
    round: number;
    stageIdx: number;
    aiCooldown: number;
  } | null>(null);

  const initRound = useCallback(
    (playerId: FighterId, stageIndex: number, roundN: number, pW: number, eW: number) => {
      const stageCfg = ARCADE_ENEMIES[stageIndex] || ARCADE_ENEMIES[0];
      const pProf = FIGHTERS[playerId];
      const eProf = FIGHTERS[stageCfg.fighter];

      engineRef.current = {
        player: {
          profile: pProf,
          x: 200,
          y: GROUND_Y,
          vx: 0,
          vy: 0,
          facing: 1,
          hp: pProf.maxHp,
          trailHp: pProf.maxHp,
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
        },
        enemy: {
          profile: eProf,
          x: 600,
          y: GROUND_Y,
          vx: 0,
          vy: 0,
          facing: -1,
          hp: eProf.maxHp,
          trailHp: eProf.maxHp,
          energy: 30,
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
        },
        projectiles: [],
        particles: [],
        banners: [
          {
            text: `ROUND ${roundN}`,
            subtext: stageCfg.stageName,
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
        pWins: pW,
        eWins: eW,
        round: roundN,
        stageIdx: stageIndex,
        aiCooldown: 25,
      };
      setRoundNum(roundN);
      setPlayerWins(pW);
      setEnemyWins(eW);
      synthRef.current?.playSfx('gong');
    },
    []
  );

  const startArcade = (charId: FighterId) => {
    setSelectedChar(charId);
    scoreRef.current = 0;
    setScore(0);
    setArcadeStageIdx(0);
    initRound(charId, 0, 1, 0, 0);
    setScreen('arena');
    synthRef.current?.startBgm();
  };

  const triggerAction = useCallback((action: 'punch' | 'kick' | 'uppercut' | 'sweep' | 'special' | 'fatality' | 'jump') => {
    const st = engineRef.current;
    if (!st) return;
    const p = st.player;

    if (st.phase === 'finish_him' && (action === 'fatality' || action === 'special' || action === 'uppercut')) {
      st.phase = 'fatality_cinematic';
      st.phaseTimer = 145;
      p.pose = 'special';
      p.poseTimer = 65;
      st.fatalityDark = 0.85;
      st.shake = 20;
      synthRef.current?.playSfx('fatality');
      for (let i = 0; i < 55; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 8.5;
        st.particles.push({
          x: st.enemy.x,
          y: st.enemy.y - 55,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 2,
          size: 4 + Math.random() * 6,
          color: i % 2 === 0 ? p.profile.projectileColor : '#fde047',
          life: 52,
          maxLife: 52,
          gravity: 0.24,
        });
      }
      st.enemy.pose = 'ko';
      st.banners.push({
        text: 'FATALITY!',
        subtext: `${p.profile.fatalityName} · +1500 BONUS`,
        color: '#ef4444',
        x: STAGE_W / 2,
        y: 185,
        life: 145,
        scale: 1.5,
      });
      scoreRef.current += 1500;
      setScore(scoreRef.current);
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

    if (p.y < GROUND_Y - 5) {
      p.pose = 'jump_kick';
      p.poseTimer = 22;
      p.poseDuration = 22;
      p.hasHitCurrentAttack = false;
      synthRef.current?.playSfx('kick');
      return;
    }

    if (action === 'special') {
      if (p.energy < 30) return;
      p.energy -= 30;
      p.pose = 'special';
      p.poseTimer = 24;
      p.poseDuration = 24;
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
        owner: 'player',
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
      p.pose = 'uppercut';
      p.poseTimer = 32;
      p.poseDuration = 32;
      p.hasHitCurrentAttack = false;
      st.shake = 10;
      synthRef.current?.playSfx('fireball');
      p.vx = p.facing * 12;
      st.projectiles.push({
        owner: 'player',
        originX: p.x + p.facing * 24,
        x: p.x + p.facing * 44,
        y: p.y - 72,
        vx: p.facing * 11.5,
        type: p.profile.projectileType,
        color: '#ef4444',
        core: '#fef08a',
        damage: 32,
        life: 80,
      });
      return;
    }

    if (action === 'uppercut') {
      p.pose = 'uppercut';
      p.poseTimer = 24;
      p.poseDuration = 24;
      p.hasHitCurrentAttack = false;
      synthRef.current?.playSfx('heavy');
    } else if (action === 'sweep') {
      p.pose = 'sweep';
      p.poseTimer = 22;
      p.poseDuration = 22;
      p.hasHitCurrentAttack = false;
      synthRef.current?.playSfx('kick');
    } else if (action === 'kick') {
      p.pose = 'kick';
      p.poseTimer = 20;
      p.poseDuration = 20;
      p.hasHitCurrentAttack = false;
      synthRef.current?.playSfx('kick');
    } else {
      p.pose = 'punch';
      p.poseTimer = 14;
      p.poseDuration = 14;
      p.hasHitCurrentAttack = false;
      synthRef.current?.playSfx('punch');
    }
  }, []);

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

      if (attacker === st.player) {
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
        // Scorpion spear yanks defender right in front of Scorpion!
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
        if (attacker === st.player) {
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

    const tick = (time: number) => {
      const st = engineRef.current;
      if (!st) return;

      if (st.hitStop > 0) {
        st.hitStop--;
      } else {
        const p = st.player;
        const e = st.enemy;

        p.trailHp += (p.hp - p.trailHp) * 0.08;
        e.trailHp += (e.hp - e.trailHp) * 0.08;

        if (st.shake > 0) st.shake *= 0.82;
        if (st.shake < 0.4) st.shake = 0;

        if (st.phase === 'intro') {
          st.phaseTimer--;
          if (st.phaseTimer === 40) {
            st.banners.push({
              text: 'FIGHT!',
              color: '#ef4444',
              x: STAGE_W / 2,
              y: 195,
              life: 55,
              scale: 1.45,
            });
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

          const left = keysRef.current['arrowleft'];
          const right = keysRef.current['arrowright'];
          const down = keysRef.current['arrowdown'];
          const blockKey = keysRef.current[' '];

          p.isBlocking = Boolean(blockKey);
          p.isCrouching = Boolean(down) && p.y >= GROUND_Y - 1;

          const canMoveP = ['idle', 'walk', 'jump', 'crouch', 'block'].includes(p.pose);
          if (canMoveP) {
            if (p.isBlocking && p.y >= GROUND_Y - 1) {
              p.pose = 'block';
              p.vx = 0;
            } else if (p.isCrouching) {
              p.pose = 'crouch';
              p.vx = 0;
            } else if (left) {
              p.vx = -p.profile.speed;
              if (p.y >= GROUND_Y - 1) {
                p.pose = 'walk';
                p.walkPhase += 0.28;
              }
            } else if (right) {
              p.vx = p.profile.speed;
              if (p.y >= GROUND_Y - 1) {
                p.pose = 'walk';
                p.walkPhase += 0.28;
              }
            } else {
              p.vx *= 0.65;
              if (p.y >= GROUND_Y - 1) p.pose = 'idle';
            }
          }

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
                  e.hasHitCurrentAttack = false;
                  st.aiCooldown = 36 - st.stageIdx * 5;
                  synthRef.current?.playSfx('punch');
                } else if (roll < 0.68) {
                  e.pose = 'kick';
                  e.poseTimer = 21;
                  e.hasHitCurrentAttack = false;
                  st.aiCooldown = 42 - st.stageIdx * 5;
                  synthRef.current?.playSfx('kick');
                } else if (roll < 0.84) {
                  e.pose = 'sweep';
                  e.poseTimer = 22;
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
                  e.hasHitCurrentAttack = false;
                  st.aiCooldown = 50 - st.stageIdx * 6;
                  synthRef.current?.playSfx('heavy');
                }
              }
            }
          }

          const checkMelee = (att: FighterRuntime, def: FighterRuntime) => {
            if (att.hasHitCurrentAttack) return;
            if (!['punch', 'kick', 'uppercut', 'sweep', 'jump_kick'].includes(att.pose)) return;

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
              st.phaseTimer = 210;
              st.banners.push({
                text: 'FINISH HIM!',
                subtext: 'Tekan [F] / FATALITY sekarang!',
                color: '#ef4444',
                x: STAGE_W / 2,
                y: 175,
                life: 160,
                scale: 1.35,
              });
              synthRef.current?.playSfx('gong');
            } else {
              e.pose = 'ko';
              st.phase = 'round_end';
              st.phaseTimer = 115;
              p.pose = 'victory';
              scoreRef.current += 500 + p.hp * 5;
              setScore(scoreRef.current);
              st.banners.push({
                text: `${p.profile.name} WINS!`,
                subtext: p.hp === p.profile.maxHp ? 'FLAWLESS VICTORY!' : `ROUND ${st.round} CLEAR`,
                color: '#fbbf24',
                x: STAGE_W / 2,
                y: 185,
                life: 115,
                scale: 1.2,
              });
              synthRef.current?.playSfx('ko');
            }
          } else if (p.hp <= 0 || (st.timer === 0 && e.hp > p.hp)) {
            const newEWins = st.eWins + 1;
            st.eWins = newEWins;
            setEnemyWins(newEWins);
            p.pose = 'ko';
            e.pose = 'victory';
            st.phase = 'round_end';
            st.phaseTimer = 120;
            st.banners.push({
              text: `${e.profile.name} WINS`,
              color: '#f43f5e',
              x: STAGE_W / 2,
              y: 185,
              life: 120,
              scale: 1.2,
            });
            synthRef.current?.playSfx('ko');
          }
        } else if (st.phase === 'finish_him') {
          st.phaseTimer--;
          const left = keysRef.current['arrowleft'];
          const right = keysRef.current['arrowright'];
          p.facing = e.x >= p.x ? 1 : -1;
          if (left) {
            p.vx = -p.profile.speed;
            p.pose = 'walk';
            p.walkPhase += 0.28;
          } else if (right) {
            p.vx = p.profile.speed;
            p.pose = 'walk';
            p.walkPhase += 0.28;
          } else {
            p.vx = 0;
            if (!['special', 'uppercut', 'punch', 'kick'].includes(p.pose)) p.pose = 'idle';
          }
          if (st.phaseTimer <= 0) {
            e.pose = 'ko';
            p.pose = 'victory';
            st.phase = 'round_end';
            st.phaseTimer = 95;
            scoreRef.current += 600 + p.hp * 5;
            setScore(scoreRef.current);
            st.banners.push({
              text: `${p.profile.name} WINS!`,
              color: '#fbbf24',
              x: STAGE_W / 2,
              y: 185,
              life: 95,
              scale: 1.2,
            });
          }
        } else if (st.phase === 'fatality_cinematic') {
          st.phaseTimer--;
          p.pose = 'victory';
          if (st.phaseTimer <= 0) {
            st.fatalityDark = 0;
            st.phase = 'round_end';
            st.phaseTimer = 15;
          }
        } else if (st.phase === 'round_end') {
          st.phaseTimer--;
          if (st.phaseTimer <= 0) {
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

          const targetTop = target.isCrouching ? target.y - 54 : target.y - 102;
          if (Math.abs(proj.x - target.x) < 28 && proj.y >= targetTop && proj.y <= target.y - 8) {
            if (proj.chill) target.chillTimer = 180;
            applyHit(attacker, target, proj.damage, 'projectile', Boolean(proj.pull));
            return false;
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

      const stageCfg = ARCADE_ENEMIES[st.stageIdx] || ARCADE_ENEMIES[0];
      ctx.save();
      if (st.shake > 0) {
        ctx.translate((Math.random() - 0.5) * st.shake * 2, (Math.random() - 0.5) * st.shake * 2);
      }

      drawArenaBackground(ctx, stageCfg.stage, time, st.fatalityDark);
      drawHumanFighter(ctx, st.enemy, time);
      drawHumanFighter(ctx, st.player, time);

      st.projectiles.forEach((proj) => drawProjectile(ctx, proj, time));

      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

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
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'left';
      ctx.fillText(st.player.profile.name, 30, 62);
      ctx.textAlign = 'right';
      ctx.fillText(st.enemy.profile.name, STAGE_W - 30, 62);

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

      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(28, STAGE_H - 28, 220, 14);
      ctx.strokeStyle = st.player.energy >= 100 ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, STAGE_H - 28, 220, 14);
      ctx.fillStyle = st.player.energy >= 100 ? '#ef4444' : st.player.energy >= 30 ? '#f59e0b' : '#0ea5e9';
      ctx.fillRect(30, STAGE_H - 26, 216 * (st.player.energy / 100), 10);
      ctx.font = '800 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(
        st.player.energy >= 100 ? 'FATALITY READY! [F]' : st.player.energy >= 30 ? 'JURUS READY [D]' : `ENERGY ${Math.floor(st.player.energy)}%`,
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
        setHudState({
          pHp: st.player.hp,
          pMax: st.player.profile.maxHp,
          pEnergy: st.player.energy,
          eHp: st.enemy.hp,
          eMax: st.enemy.profile.maxHp,
          timer: st.timer,
          finishHim: st.phase === 'finish_him',
          combo: st.player.comboCount,
        });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [screen, selectedChar, initRound, saveScoreToDb]);

  const holdKey = (key: string, down: boolean) => {
    keysRef.current[key] = down;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden rounded-2xl border border-red-900/40 relative">
      <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-900/95 border-b border-red-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              synthRef.current?.stopBgm();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-extrabold transition-all"
          >
            <ArrowLeft size={14} /> Kembali
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 hidden sm:inline">
            Informatika Kombat · 16-Bit SNES
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 tabular-nums">
            <Trophy size={14} /> {score} Poin
          </div>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center p-2 md:p-4 overflow-y-auto custom-scrollbar">
        {screen === 'title' && (
          <div className="max-w-2xl w-full text-center space-y-6 py-6 px-4 bg-gradient-to-b from-slate-900 to-black rounded-3xl border-2 border-amber-500/40 shadow-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-red-400">
              <Flame size={16} /> 16-BIT REAL-TIME ARCADE FIGHTER
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-500 to-red-600 drop-shadow">
              INFORMATIKA KOMBAT
            </h1>
            <p className="text-sm text-slate-300 max-w-lg mx-auto font-medium">
              Pertarungan seni bela diri real-time ala Mortal Kombat SNES! Kendalikan Scorpio Byte, Sub-Byte Zero, Liu Algorithm, & Raiden Volt dengan jurus ikonik Kunai Berantai, Ice Ball, Naga Api, hingga <b>FATALITY!</b>
            </p>

            <div className="grid grid-cols-4 gap-2 max-w-xl mx-auto pt-2">
              {PLAYABLE_IDS.map((fid) => (
                <div key={fid} className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 flex flex-col items-center">
                  <FighterPortrait id={fid} active={false} />
                  <span className="text-[10px] font-black text-amber-300 mt-1 truncate w-full">{FIGHTERS[fid].name}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  synthRef.current?.playSfx('gong');
                  setScreen('select');
                }}
                className="px-10 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Swords size={22} /> PILIH PETARUNG
              </button>
            </div>
          </div>
        )}

        {screen === 'select' && (
          <div className="max-w-4xl w-full space-y-5">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-amber-400 uppercase tracking-tight">
                Pilih Pejuang Kamu (Arcade 3 Stage)
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Kalahkan Ermac Syntax, Reptile Malware, hingga bos terakhir Shao Trojan!
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PLAYABLE_IDS.map((fid) => {
                const f = FIGHTERS[fid];
                const isSel = selectedChar === fid;
                return (
                  <div
                    key={fid}
                    onClick={() => {
                      setSelectedChar(fid);
                      synthRef.current?.playSfx('select');
                    }}
                    className={cn(
                      'cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col items-center text-center bg-slate-900/95',
                      isSel
                        ? 'border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-600'
                    )}
                  >
                    <FighterPortrait id={fid} active={isSel} />
                    <h3 className="text-sm font-black text-white mt-2">{f.name}</h3>
                    <p className="text-[11px] font-bold text-amber-400">{f.codename}</p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{f.specialDesc}</p>
                    <div className="w-full mt-3 pt-2 border-t border-slate-800 text-[11px] font-bold flex justify-between text-slate-300">
                      <span>HP {f.maxHp}</span>
                      <span>Jurus: {f.specialName}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-black text-amber-300 uppercase">Kontrol Keyboard:</p>
                <p>
                  <b>← / →</b> = Jalan · <b>↑</b> = Lompat · <b>↓</b> = Jongkok · <b>A</b> = Pukul · <b>S</b> = Tendang · <b>W / ↓+A</b> = Uppercut · <b>↓+S</b> = Sapu · <b>D</b> = Jurus · <b>Spasi</b> = Block · <b>F</b> = Fatality
                </p>
              </div>
              <button
                onClick={() => startArcade(selectedChar)}
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black rounded-xl shadow-lg shrink-0 active:scale-95 transition-all"
              >
                MULAI BERTARUNG!
              </button>
            </div>
          </div>
        )}

        {screen === 'arena' && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-2">
            <div className="w-full flex items-center justify-between text-xs font-extrabold text-slate-400 px-1">
              <span>
                STAGE {arcadeStageIdx + 1}/3 · {ARCADE_ENEMIES[arcadeStageIdx]?.stageName}
              </span>
              <span className="text-amber-300">
                ROUND {roundNum} · {playerWins} - {enemyWins}
              </span>
            </div>

            <div className="w-full relative rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-black">
              <canvas
                ref={canvasRef}
                width={STAGE_W}
                height={STAGE_H}
                className="w-full h-auto block"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  onMouseDown={() => holdKey('arrowleft', true)}
                  onMouseUp={() => holdKey('arrowleft', false)}
                  onMouseLeave={() => holdKey('arrowleft', false)}
                  onTouchStart={(e) => { e.preventDefault(); holdKey('arrowleft', true); }}
                  onTouchEnd={() => holdKey('arrowleft', false)}
                  className="w-11 h-11 rounded-xl bg-slate-800 active:bg-amber-600 border border-slate-700 flex items-center justify-center font-black"
                  title="Mundur / Kiri (←)"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => triggerAction('jump')}
                    className="w-11 h-8 rounded-lg bg-slate-800 active:bg-amber-600 border border-slate-700 flex items-center justify-center font-black"
                    title="Lompat (↑)"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onMouseDown={() => holdKey('arrowdown', true)}
                    onMouseUp={() => holdKey('arrowdown', false)}
                    onMouseLeave={() => holdKey('arrowdown', false)}
                    onTouchStart={(e) => { e.preventDefault(); holdKey('arrowdown', true); }}
                    onTouchEnd={() => holdKey('arrowdown', false)}
                    className="w-11 h-8 rounded-lg bg-slate-800 active:bg-amber-600 border border-slate-700 flex items-center justify-center font-black"
                    title="Jongkok (↓)"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <button
                  onMouseDown={() => holdKey('arrowright', true)}
                  onMouseUp={() => holdKey('arrowright', false)}
                  onMouseLeave={() => holdKey('arrowright', false)}
                  onTouchStart={(e) => { e.preventDefault(); holdKey('arrowright', true); }}
                  onTouchEnd={() => holdKey('arrowright', false)}
                  className="w-11 h-11 rounded-xl bg-slate-800 active:bg-amber-600 border border-slate-700 flex items-center justify-center font-black"
                  title="Maju / Kanan (→)"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 justify-end flex-1">
                <button
                  onMouseDown={() => holdKey(' ', true)}
                  onMouseUp={() => holdKey(' ', false)}
                  onMouseLeave={() => holdKey(' ', false)}
                  onTouchStart={(e) => { e.preventDefault(); holdKey(' ', true); }}
                  onTouchEnd={() => holdKey(' ', false)}
                  className="px-3 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 active:scale-95 text-xs font-black flex items-center gap-1"
                >
                  <Shield size={14} /> BLOCK [Spasi]
                </button>
                <button
                  onClick={() => triggerAction('punch')}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-black"
                >
                  PUKUL [A]
                </button>
                <button
                  onClick={() => triggerAction('kick')}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-xs font-black"
                >
                  TENDANG [S]
                </button>
                <button
                  onClick={() => triggerAction('uppercut')}
                  className="px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-xs font-black"
                >
                  UPPERCUT [W / ↓+A]
                </button>
                <button
                  onClick={() => triggerAction('special')}
                  disabled={hudState.pEnergy < 30}
                  className={cn(
                    'px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all',
                    hudState.pEnergy >= 30
                      ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  )}
                >
                  <Zap size={14} /> JURUS [D]
                </button>
                <button
                  onClick={() => triggerAction('fatality')}
                  disabled={!hudState.finishHim && hudState.pEnergy < 100}
                  className={cn(
                    'px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all',
                    hudState.finishHim || hudState.pEnergy >= 100
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white animate-pulse ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  )}
                >
                  <Flame size={14} /> FATALITY [F]
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === 'victory' && (
          <div className="max-w-md w-full bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/40">
              <Trophy size={34} />
            </div>
            <h2 className="text-3xl font-black text-amber-400">CHAMPION OF KOMBAT!</h2>
            <p className="text-sm text-slate-300">
              Luar biasa! Kamu berhasil menaklukkan seluruh 3 stage termasuk Shao Trojan!
            </p>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Skor</p>
              <p className="text-4xl font-black text-amber-400 tabular-nums mt-1">{score} Poin</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setScreen('select')}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-500 font-black rounded-xl text-sm"
              >
                Main Lagi
              </button>
              <button
                onClick={onExit}
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
              Kamu mencapai Stage {arcadeStageIdx + 1} dengan total skor {score} poin. Coba lagi dan gunakan kombinasi Block + Uppercut!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => startArcade(selectedChar)}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 font-black rounded-xl text-sm"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => setScreen('select')}
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
