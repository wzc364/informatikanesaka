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
  Pause,
  Play,
  Home,
  BookOpen,
  Film,
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
import knightCrouchUrl from '../assets/images/knight_crouch_v4_1794972514047.jpg';
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
import queenUppercutUrl from '../assets/images/queen_uppercut_v3_1794972515381.jpg';
import queenCrouchUrl from '../assets/images/queen_crouch_v4_1794972515454.jpg';
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
import kamenBladeIdleUrl from '../assets/images/kamen_blade_idle_1794875347860.jpg';
import kamenBladePunchUrl from '../assets/images/kamen_blade_punch_1794876793680.jpg';
import kamenBladeKickUrl from '../assets/images/kamen_blade_kick_1794876794775.jpg';
import kamenBladeUppercutUrl from '../assets/images/kamen_blade_uppercut_1794876794745.jpg';
import kamenBladeCrouchUrl from '../assets/images/kamen_blade_crouch_v2_1794876838175.jpg';
import kamenBladeSpecialUrl from '../assets/images/kamen_blade_special_1794876796327.jpg';
import kamenBladeBlockUrl from '../assets/images/kamen_blade_block_1794876796573.jpg';
import kamenBladeHitUrl from '../assets/images/kamen_blade_hit_1794876797344.jpg';
import kamenBladeFallUrl from '../assets/images/kamen_blade_fall_1794876798228.jpg';
import kamenBladeVictoryUrl from '../assets/images/kamen_blade_victory_1794876798487.jpg';
import kamenGeatsIdleUrl from '../assets/images/kamen_geats_idle_1794875346073.jpg';
import kamenGeatsPunchUrl from '../assets/images/kamen_geats_punch_1794876816592.jpg';
import kamenGeatsKickUrl from '../assets/images/kamen_geats_kick_1794876817199.jpg';
import kamenGeatsUppercutUrl from '../assets/images/kamen_geats_uppercut_1794876817491.jpg';
import kamenGeatsCrouchUrl from '../assets/images/kamen_geats_crouch_v2_1794876839194.jpg';
import kamenGeatsSpecialUrl from '../assets/images/kamen_geats_special_1794876819271.jpg';
import kamenGeatsBlockUrl from '../assets/images/kamen_geats_block_1794876819631.jpg';
import kamenGeatsHitUrl from '../assets/images/kamen_geats_hit_1794876819938.jpg';
import kamenGeatsFallUrl from '../assets/images/kamen_geats_fall_1794876821212.jpg';
import kamenGeatsVictoryUrl from '../assets/images/kamen_geats_victory_1794876821160.jpg';
import ultramanNexusIdleUrl from '../assets/images/ultraman_nexus_idle_1794875347850.jpg';
import ultramanNexusPunchUrl from '../assets/images/ultraman_nexus_punch_1794876839434.jpg';
import ultramanNexusKickUrl from '../assets/images/ultraman_nexus_kick_1794876839746.jpg';
import ultramanNexusUppercutUrl from '../assets/images/ultraman_nexus_uppercut_1794876840396.jpg';
import ultramanNexusCrouchUrl from '../assets/images/ultraman_nexus_crouch_1794876840316.jpg';
import ultramanNexusSpecialUrl from '../assets/images/ultraman_nexus_special_1794876842141.jpg';
import ultramanNexusBlockUrl from '../assets/images/ultraman_nexus_block_1794876842227.jpg';
import ultramanNexusHitUrl from '../assets/images/ultraman_nexus_hit_1794876843106.jpg';
import ultramanNexusFallUrl from '../assets/images/ultraman_nexus_fall_v2_1794905960923.jpg';
import ultramanNexusVictoryUrl from '../assets/images/ultraman_nexus_victory_1794905962687.jpg';
import ultramanZeroIdleUrl from '../assets/images/ultraman_zero_idle_1794875348848.jpg';
import ultramanZeroPunchUrl from '../assets/images/ultraman_zero_punch_1794905964470.jpg';
import ultramanZeroKickUrl from '../assets/images/ultraman_zero_kick_1794905963565.jpg';
import ultramanZeroUppercutUrl from '../assets/images/ultraman_zero_uppercut_1794905968031.jpg';
import ultramanZeroCrouchUrl from '../assets/images/ultraman_zero_crouch_1794905963863.jpg';
import ultramanZeroSpecialUrl from '../assets/images/ultraman_zero_special_1794905964718.jpg';
import ultramanZeroBlockUrl from '../assets/images/ultraman_zero_block_1794905965053.jpg';
import ultramanZeroHitUrl from '../assets/images/ultraman_zero_hit_1794905966661.jpg';
import ultramanZeroFallUrl from '../assets/images/ultraman_zero_fall_1794905965704.jpg';
import ultramanZeroVictoryUrl from '../assets/images/ultraman_zero_victory_1794905966987.jpg';
import arenaCourtyardUrl from '../assets/images/arena_courtyard_1794842649485.jpg';
import arenaPitUrl from '../assets/images/arena_pit_1794842650148.jpg';
import arenaThroneUrl from '../assets/images/arena_throne_1794842650958.jpg';
import arenaCyberLabUrl from '../assets/images/arena_cyber_lab_1794843714639.jpg';
import arenaVolcanoUrl from '../assets/images/arena_volcano_1794843715878.jpg';
import arenaIceTempleUrl from '../assets/images/arena_ice_temple_1794843716320.jpg';
import arenaAcidJungleUrl from '../assets/images/arena_acid_jungle_1794843716457.jpg';
import arenaThunderPeakUrl from '../assets/images/arena_thunder_peak_1794843717458.jpg';
import arenaQuantumVoidUrl from '../assets/images/arena_quantum_void_1794843717830.jpg';
import cyberPhoneIdleUrl from '../assets/images/cyber_phone_idle_1794907606017.jpg';
import cyberPhonePunchUrl from '../assets/images/cyber_phone_punch_1794907644186.jpg';
import cyberPhoneKickUrl from '../assets/images/cyber_phone_kick_1794907644829.jpg';
import cyberPhoneUppercutUrl from '../assets/images/cyber_phone_uppercut_1794907644847.jpg';
import cyberPhoneCrouchUrl from '../assets/images/cyber_phone_crouch_1794907646134.jpg';
import cyberPhoneSpecialUrl from '../assets/images/cyber_phone_special_1794907646691.jpg';
import cyberPhoneBlockUrl from '../assets/images/cyber_phone_block_1794907648310.jpg';
import cyberPhoneHitUrl from '../assets/images/cyber_phone_hit_1794907652338.jpg';
import cyberPhoneFallUrl from '../assets/images/cyber_phone_fall_1794907649117.jpg';
import cyberPhoneVictoryUrl from '../assets/images/cyber_phone_victory_1794907650574.jpg';
import mechaMouseIdleUrl from '../assets/images/mecha_mouse_idle_1794907606859.jpg';
import mechaMousePunchUrl from '../assets/images/mecha_mouse_punch_1794907650505.jpg';
import mechaMouseKickUrl from '../assets/images/mecha_mouse_kick_1794907650681.jpg';
import mechaMouseUppercutUrl from '../assets/images/mecha_mouse_uppercut_1794907651621.jpg';
import mechaMouseCrouchUrl from '../assets/images/mecha_mouse_crouch_1794907674409.jpg';
import mechaMouseSpecialUrl from '../assets/images/mecha_mouse_special_1794907652301.jpg';
import mechaMouseBlockUrl from '../assets/images/mecha_mouse_block_1794907652603.jpg';
import mechaMouseHitUrl from '../assets/images/mecha_mouse_hit_1794907653657.jpg';
import mechaMouseFallUrl from '../assets/images/mecha_mouse_fall_1794907675395.jpg';
import mechaMouseVictoryUrl from '../assets/images/mecha_mouse_victory_1794907656963.jpg';
import keyTitanIdleUrl from '../assets/images/key_titan_idle_1794907607319.jpg';
import keyTitanPunchUrl from '../assets/images/key_titan_punch_1794907676490.jpg';
import keyTitanKickUrl from '../assets/images/key_titan_kick_1794907677434.jpg';
import keyTitanUppercutUrl from '../assets/images/key_titan_uppercut_1794907678171.jpg';
import keyTitanCrouchUrl from '../assets/images/key_titan_crouch_1794907678761.jpg';
import keyTitanSpecialUrl from '../assets/images/key_titan_special_1794907678953.jpg';
import keyTitanBlockUrl from '../assets/images/key_titan_block_1794907679956.jpg';
import keyTitanHitUrl from '../assets/images/key_titan_hit_1794907681020.jpg';
import keyTitanFallUrl from '../assets/images/key_titan_fall_1794907680466.jpg';
import keyTitanVictoryUrl from '../assets/images/key_titan_victory_1794907682203.jpg';
import fatScorpio1Url from '../assets/images/fatality_scorpio_1_1794907608490.jpg';
import fatScorpio2Url from '../assets/images/fatality_scorpio_2_1794907609110.jpg';
import fatScorpio3Url from '../assets/images/fatality_scorpio_3_1794907610234.jpg';
import fatKamenRider1Url from '../assets/images/fatality_kamen_rider_1_1794907610037.jpg';
import fatKamenRider2Url from '../assets/images/fatality_kamen_rider_2_1794907611568.jpg';
import fatKamenRider3Url from '../assets/images/fatality_kamen_rider_3_1794907683990.jpg';
import fatKnight1Url from '../assets/images/fatality_knight_1_1794907612281.jpg';
import fatKnight2Url from '../assets/images/fatality_knight_2_1794907612883.jpg';
import fatKnight3Url from '../assets/images/fatality_knight_3_1794907613741.jpg';
import fatBisop1Url from '../assets/images/fatality_bisop_1_1794907614452.jpg';
import fatBisop2Url from '../assets/images/fatality_bisop_2_1794907615094.jpg';
import fatBisop3Url from '../assets/images/fatality_bisop_3_1794907615629.jpg';
import fatQueen1Url from '../assets/images/fatality_queen_1_1794907710990.jpg';
import fatQueen2Url from '../assets/images/fatality_queen_2_1794907710908.jpg';
import fatQueen3Url from '../assets/images/fatality_queen_3_1794907711128.jpg';
import fatVirusRex1Url from '../assets/images/fatality_virus_rex_1_1794907711420.jpg';
import fatVirusRex2Url from '../assets/images/fatality_virus_rex_2_1794907712062.jpg';
import fatVirusRex3Url from '../assets/images/fatality_virus_rex_3_1794907713899.jpg';
import fatKamenBlade1Url from '../assets/images/fatality_kamen_blade_1_1794907714021.jpg';
import fatKamenBlade2Url from '../assets/images/fatality_kamen_blade_2_1794907714111.jpg';
import fatKamenBlade3Url from '../assets/images/fatality_kamen_blade_3_1794907714799.jpg';
import fatKamenGeats1Url from '../assets/images/fatality_kamen_geats_1_1794907715218.jpg';
import fatKamenGeats2Url from '../assets/images/fatality_kamen_geats_2_1794907715975.jpg';
import fatKamenGeats3Url from '../assets/images/fatality_kamen_geats_3_1794907716187.jpg';
import fatUltramanNexus1Url from '../assets/images/fatality_ultraman_nexus_1_1794907717661.jpg';
import fatUltramanNexus2Url from '../assets/images/fatality_ultraman_nexus_2_1794907718155.jpg';
import fatUltramanNexus3Url from '../assets/images/fatality_ultraman_nexus_3_1794907718621.jpg';
import fatUltramanZero1Url from '../assets/images/fatality_ultraman_zero_1_1794907739271.jpg';
import fatUltramanZero2Url from '../assets/images/fatality_ultraman_zero_2_1794907739733.jpg';
import fatUltramanZero3Url from '../assets/images/fatality_ultraman_zero_3_1794907740182.jpg';
import fatCyberPhone1Url from '../assets/images/fatality_cyber_phone_1_1794907739850.jpg';
import fatCyberPhone2Url from '../assets/images/fatality_cyber_phone_2_1794907741692.jpg';
import fatCyberPhone3Url from '../assets/images/fatality_cyber_phone_3_1794907742089.jpg';
import fatMechaMouse1Url from '../assets/images/fatality_mecha_mouse_1_1794907742937.jpg';
import fatMechaMouse2Url from '../assets/images/fatality_mecha_mouse_2_1794907743200.jpg';
import fatMechaMouse3Url from '../assets/images/fatality_mecha_mouse_3_1794907743040.jpg';
import fatKeyTitan1Url from '../assets/images/fatality_key_titan_1_1794907743335.jpg';
import fatKeyTitan2Url from '../assets/images/fatality_key_titan_2_1794907745211.jpg';
import fatKeyTitan3Url from '../assets/images/fatality_key_titan_3_1794907745309.jpg';
import scorpioWalkSheetUrl from '../assets/images/scorpio_walk_sheet_1794909400923.jpg';
import scorpioJumpSheetUrl from '../assets/images/scorpio_jump_sheet_1794909403237.jpg';
import kamenRiderWalkSheetUrl from '../assets/images/kamen_rider_walk_sheet_1794909407506.jpg';
import kamenRiderJumpSheetUrl from '../assets/images/kamen_rider_jump_sheet_1794909411334.jpg';
import knightWalkSheetUrl from '../assets/images/knight_walk_sheet_1794909414386.jpg';
import knightJumpSheetUrl from '../assets/images/knight_jump_sheet_1794909418950.jpg';
import bisopWalkSheetUrl from '../assets/images/bisop_walk_sheet_1794909422429.jpg';
import bisopJumpSheetUrl from '../assets/images/bisop_jump_sheet_1794909425705.jpg';
import queenWalkSheetUrl from '../assets/images/queen_walk_sheet_1794909428398.jpg';
import queenJumpSheetUrl from '../assets/images/queen_jump_sheet_1794909437200.jpg';
import virusRexWalkSheetUrl from '../assets/images/virus_rex_walk_sheet_1794909435298.jpg';
import virusRexJumpSheetUrl from '../assets/images/virus_rex_jump_sheet_1794909440061.jpg';
import kamenBladeWalkSheetUrl from '../assets/images/kamen_blade_walk_sheet_1794909442560.jpg';
import kamenBladeJumpSheetUrl from '../assets/images/kamen_blade_jump_sheet_1794909446792.jpg';
import kamenGeatsWalkSheetUrl from '../assets/images/kamen_geats_walk_sheet_1794909449506.jpg';
import kamenGeatsJumpSheetUrl from '../assets/images/kamen_geats_jump_sheet_1794909453433.jpg';
import ultramanNexusWalkSheetUrl from '../assets/images/ultraman_nexus_walk_sheet_v4_1794972515450.jpg';
import ultramanNexusJumpSheetUrl from '../assets/images/ultraman_nexus_jump_sheet_1794909460456.jpg';
import ultramanZeroWalkSheetUrl from '../assets/images/ultraman_zero_walk_sheet_1794909464309.jpg';
import ultramanZeroJumpSheetUrl from '../assets/images/ultraman_zero_jump_sheet_v2_1794971247255.jpg';
import cyberPhoneWalkSheetUrl from '../assets/images/cyber_phone_walk_sheet_1794909471193.jpg';
import cyberPhoneJumpSheetUrl from '../assets/images/cyber_phone_jump_sheet_1794909474400.jpg';
import mechaMouseWalkSheetUrl from '../assets/images/mecha_mouse_walk_sheet_1794909478421.jpg';
import mechaMouseJumpSheetUrl from '../assets/images/mecha_mouse_jump_sheet_1794909480929.jpg';
import keyTitanWalkSheetUrl from '../assets/images/key_titan_walk_sheet_1794909485311.jpg';
import keyTitanJumpSheetUrl from '../assets/images/key_titan_jump_sheet_1794909486365.jpg';
import kamenKabutoIdleUrl from '../assets/images/kamen_kabuto_idle_v2_1794975275137.jpg';
import kamenKabutoPunchWindupUrl from '../assets/images/kamen_kabuto_punch_v2_1794975298638.jpg';
import kamenKabutoPunchUrl from '../assets/images/kamen_kabuto_punch_v2_1794975298638.jpg';
import kamenKabutoKickChamberUrl from '../assets/images/kamen_kabuto_kick_v2_1794975298073.jpg';
import kamenKabutoKickUrl from '../assets/images/kamen_kabuto_kick_v2_1794975298073.jpg';
import kamenKabutoUppercutCoilUrl from '../assets/images/kamen_kabuto_uppercut_v2_1794975297981.jpg';
import kamenKabutoUppercutUrl from '../assets/images/kamen_kabuto_uppercut_v2_1794975297981.jpg';
import kamenKabutoCrouchUrl from '../assets/images/kamen_kabuto_crouch_v2_1794975278246.jpg';
import kamenKabutoSpecialChargeUrl from '../assets/images/kamen_kabuto_special_v2_1794975297591.jpg';
import kamenKabutoSpecialUrl from '../assets/images/kamen_kabuto_special_v2_1794975297591.jpg';
import kamenKabutoBlockUrl from '../assets/images/kamen_kabuto_idle_v2_1794975275137.jpg';
import kamenKabutoHitUrl from '../assets/images/kamen_kabuto_crouch_v2_1794975278246.jpg';
import kamenKabutoFallUrl from '../assets/images/kamen_kabuto_crouch_v2_1794975278246.jpg';
import kamenKabutoVictoryUrl from '../assets/images/kamen_kabuto_idle_v2_1794975275137.jpg';
import kamenKabutoWalkSheetUrl from '../assets/images/kamen_kabuto_walk_sheet_v3_1794977723677.jpg';
import kamenKabutoJumpSheetUrl from '../assets/images/kamen_kabuto_jump_sheet_v3_1794977724470.jpg';
import fatKamenKabuto1Url from '../assets/images/fatality_kamen_kabuto_1_1794971308205.jpg';
import fatKamenKabuto2Url from '../assets/images/fatality_kamen_kabuto_2_1794971308725.jpg';
import fatKamenKabuto3Url from '../assets/images/fatality_kamen_kabuto_3_1794971309177.jpg';
import storyCyberPhoneUrl from '../assets/images/story_cyber_phone_1794911270312.jpg';
import storyMechaMouseUrl from '../assets/images/story_mecha_mouse_1794911274004.jpg';
import storyKeyTitanUrl from '../assets/images/story_key_titan_1794911270626.jpg';
import storyVirusRexUrl from '../assets/images/story_virus_rex_1794911272810.jpg';
import storyKnightUrl from '../assets/images/story_knight_1794911272230.jpg';
import storyKamenGeatsUrl from '../assets/images/story_kamen_geats_1794911273505.jpg';
import storyKamenBladeUrl from '../assets/images/story_kamen_blade_1794911274488.jpg';
import storyUltramanZeroUrl from '../assets/images/story_ultraman_zero_1794911275031.jpg';

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
  | 'kamen_rider'
  | 'knight'
  | 'bisop'
  | 'queen'
  | 'virus_rex'
  | 'kamen_blade'
  | 'kamen_geats'
  | 'kamen_kabuto'
  | 'ultraman_nexus'
  | 'ultraman_zero'
  | 'cyber_phone'
  | 'mecha_mouse'
  | 'key_titan';

type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type PoseState =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'jump_land'
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

type StoryRoute = 'hero' | 'monster';

interface FighterProfile {
  id: FighterId;
  faction: StoryRoute;
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
  hairOrHat: 'ninja_hood' | 'shaolin_hair' | 'raiden_hat' | 'shao_helm' | 'kamen_helmet';
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
    faction: 'hero',
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
  kamen_rider: {
    id: 'kamen_rider',
    faction: 'hero',
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
    faction: 'hero',
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
    faction: 'hero',
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
    faction: 'hero',
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
    faction: 'monster',
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
  kamen_blade: {
    id: 'kamen_blade',
    faction: 'hero',
    name: 'KAMEN BLADE',
    codename: 'Ksatria Kumbang Kuantum',
    style: 'Bladelabard & King Form Slash',
    specialName: 'Royal Straight Flush',
    specialDesc: 'Tebasan energi elemental kuantum berkecepatan cahaya!',
    fatalityName: 'FOUR CARDS OBLITERATION',
    skin: '#e0a97d',
    skinHighlight: '#f3c6a0',
    skinShadow: '#a97047',
    primary: '#1d4ed8',
    primaryLight: '#fbbf24',
    secondary: '#1e3a8a',
    suitDark: '#090d16',
    pants: '#0f172a',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#22c55e',
    projectileType: 'lightning',
    projectileColor: '#fbbf24',
    projectileCore: '#ffffff',
    speed: 5.1,
    power: 1.18,
    maxHp: 120,
  },
  kamen_geats: {
    id: 'kamen_geats',
    faction: 'hero',
    name: 'KAMEN GEATS',
    codename: 'Ksatria Rubah Magnum',
    style: 'Magnum Shooter & Boost Strike',
    specialName: 'Grand Victory Cannon',
    specialDesc: 'Tembakan laser magnum berdaya hancur masif!',
    fatalityName: 'GODDESS RESET FINISHER',
    skin: '#f8fafc',
    skinHighlight: '#ffffff',
    skinShadow: '#94a3b8',
    primary: '#dc2626',
    primaryLight: '#fca5a5',
    secondary: '#991b1b',
    suitDark: '#1e293b',
    pants: '#0f172a',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#06b6d4',
    projectileType: 'plasma',
    projectileColor: '#ef4444',
    projectileCore: '#ffffff',
    speed: 5.3,
    power: 1.15,
    maxHp: 115,
  },
  kamen_kabuto: {
    id: 'kamen_kabuto',
    faction: 'hero',
    name: 'KAMEN KABUTO',
    codename: 'Ksatria Kumbang Clock Up',
    style: 'Clock Up & Roundhouse Rider Kick',
    specialName: 'Clock Up Rider Kick',
    specialDesc: 'Mengaktifkan kecepatan cahaya Clock Up dan melepaskan gelombang energi Rider Kick!',
    fatalityName: 'MAXIMUM RIDER POWER',
    skin: '#e2e8f0',
    skinHighlight: '#ffffff',
    skinShadow: '#64748b',
    primary: '#dc2626',
    primaryLight: '#38bdf8',
    secondary: '#991b1b',
    suitDark: '#09090b',
    pants: '#111827',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#38bdf8',
    projectileType: 'lightning',
    projectileColor: '#ef4444',
    projectileCore: '#38bdf8',
    speed: 5.55,
    power: 1.22,
    maxHp: 120,
  },
  ultraman_nexus: {
    id: 'ultraman_nexus',
    faction: 'hero',
    name: 'ULTRAMAN NEXUS',
    codename: 'Prajurit Cahaya Core',
    style: 'Meta-Field & Core Crusher',
    specialName: 'Schumann Arrow Ray',
    specialDesc: 'Panah cahaya pembersih dimensi kegelapan!',
    fatalityName: 'CORE DISINTEGRATION',
    skin: '#cbd5e1',
    skinHighlight: '#f1f5f9',
    skinShadow: '#64748b',
    primary: '#dc2626',
    primaryLight: '#38bdf8',
    secondary: '#991b1b',
    suitDark: '#0f172a',
    pants: '#0b1120',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#38bdf8',
    projectileType: 'lightning',
    projectileColor: '#38bdf8',
    projectileCore: '#ffffff',
    speed: 5.2,
    power: 1.2,
    maxHp: 130,
  },
  ultraman_zero: {
    id: 'ultraman_zero',
    faction: 'hero',
    name: 'ULTRAMAN ZERO',
    codename: 'Kesatria Plasma Zero',
    style: 'Zero Slugger & Wide Zero Shot',
    specialName: 'Wide Zero Beam',
    specialDesc: 'Sinar plasma pemusnah berenergi tinggi!',
    fatalityName: 'ULTIMATE ZERO SLICE',
    skin: '#e2e8f0',
    skinHighlight: '#ffffff',
    skinShadow: '#475569',
    primary: '#2563eb',
    primaryLight: '#fde047',
    secondary: '#dc2626',
    suitDark: '#090d16',
    pants: '#0f172a',
    hairOrHat: 'kamen_helmet',
    eyeGlow: '#fde047',
    projectileType: 'plasma',
    projectileColor: '#38bdf8',
    projectileCore: '#fef08a',
    speed: 5.4,
    power: 1.22,
    maxHp: 125,
  },
  cyber_phone: {
    id: 'cyber_phone',
    faction: 'monster',
    name: 'PHONEX TITAN',
    codename: 'Monster Smartphone Kuantum',
    style: '5G Signal Crush & AMOLED Shield',
    specialName: '5G Overload Beam',
    specialDesc: 'Memancarkan gelombang sinyal 5G & petir baterai bertegangan tinggi!',
    fatalityName: '5G OVERLOAD MELTDOWN',
    skin: '#334155',
    skinHighlight: '#64748b',
    skinShadow: '#0f172a',
    primary: '#06b6d4',
    primaryLight: '#67e8f9',
    secondary: '#0e7490',
    suitDark: '#090d16',
    pants: '#0f172a',
    hairOrHat: 'shao_helm',
    scale: 1.06,
    eyeGlow: '#22d3ee',
    projectileType: 'lightning',
    projectileColor: '#06b6d4',
    projectileCore: '#ffffff',
    speed: 4.85,
    power: 1.18,
    maxHp: 125,
  },
  mecha_mouse: {
    id: 'mecha_mouse',
    faction: 'monster',
    name: 'CLICKER FANG',
    codename: 'Monster Mouse Optik Siber',
    style: 'Turbo-DPI Rush & Sensor Slash',
    specialName: 'Optical Laser Snap',
    specialDesc: 'Menembakkan laser sensor optik berkecepatan super tinggi!',
    fatalityName: 'OPTICAL LASER DISSECTION',
    skin: '#334155',
    skinHighlight: '#94a3b8',
    skinShadow: '#0f172a',
    primary: '#ec4899',
    primaryLight: '#f9a8d4',
    secondary: '#be185d',
    suitDark: '#09090b',
    pants: '#18181b',
    hairOrHat: 'shao_helm',
    scale: 1.05,
    eyeGlow: '#f43f5e',
    projectileType: 'plasma',
    projectileColor: '#f43f5e',
    projectileCore: '#ffffff',
    speed: 5.35,
    power: 1.14,
    maxHp: 115,
  },
  key_titan: {
    id: 'key_titan',
    faction: 'monster',
    name: 'MECH KEYS GOLEM',
    codename: 'Monster Keyboard Mekanikal',
    style: 'RGB Switch Slam & Ctrl+Alt Crush',
    specialName: 'Ctrl+Alt+Del Crush',
    specialDesc: 'Menembakkan ledakan gelombang tombol mekanikal RGB!',
    fatalityName: 'CTRL+ALT+DELETE PURGE',
    skin: '#334155',
    skinHighlight: '#64748b',
    skinShadow: '#0f172a',
    primary: '#8b5cf6',
    primaryLight: '#c4b5fd',
    secondary: '#5b21b6',
    suitDark: '#090d16',
    pants: '#18181b',
    hairOrHat: 'shao_helm',
    scale: 1.08,
    eyeGlow: '#4ade80',
    projectileType: 'plasma',
    projectileColor: '#a855f7',
    projectileCore: '#4ade80',
    speed: 4.45,
    power: 1.24,
    maxHp: 135,
  },
};

type SoloVariant = 'challenge' | 'free' | 'training';
type FreeDifficulty = 'mudah' | 'normal' | 'sulit' | 'elite';
type TrainingDummyBehavior = 'diam' | 'jongkok' | 'blokir' | 'serang';

const FREE_DIFFICULTY_CFG: Record<FreeDifficulty, { hpMult: number; powerMult: number; speedMult: number; diffLevel: number; label: string }> = {
  mudah: { hpMult: 0.8, powerMult: 0.85, speedMult: 0.85, diffLevel: 0.1, label: 'Mudah' },
  normal: { hpMult: 1.0, powerMult: 1.0, speedMult: 1.0, diffLevel: 0.4, label: 'Normal' },
  sulit: { hpMult: 1.25, powerMult: 1.15, speedMult: 1.1, diffLevel: 0.75, label: 'Sulit' },
  elite: { hpMult: 1.5, powerMult: 1.3, speedMult: 1.2, diffLevel: 1.0, label: 'Elite Boss' },
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
  'kamen_rider',
  'knight',
  'bisop',
  'queen',
  'kamen_blade',
  'kamen_geats',
  'kamen_kabuto',
  'ultraman_nexus',
  'ultraman_zero',
  'virus_rex',
  'cyber_phone',
  'mecha_mouse',
  'key_titan',
];

const HERO_IDS: FighterId[] = PLAYABLE_IDS.filter((id) => FIGHTERS[id].faction === 'hero');
const MONSTER_IDS: FighterId[] = PLAYABLE_IDS.filter((id) => FIGHTERS[id].faction === 'monster');

type ArcadeSubMode = 'solo' | 'hero_story' | 'monster_story';

interface SoloStageConfig {
  fighter: FighterId;
  stage: StageId;
  stageName: string;
  tierLabel: string;
  hpMult: number;
  powerMult: number;
  speedMult: number;
}

const SOLO_STAGES: SoloStageConfig[] = [
  { fighter: 'bisop', stage: 1, stageName: 'KUIL MALAM', tierLabel: 'MUDAH', hpMult: 0.9, powerMult: 0.85, speedMult: 0.92 },
  { fighter: 'queen', stage: 2, stageName: 'ARENA ASAM', tierLabel: 'NORMAL', hpMult: 0.98, powerMult: 0.94, speedMult: 0.98 },
  { fighter: 'cyber_phone', stage: 4, stageName: 'LAB SERVER SIBER', tierLabel: 'MENENGAH', hpMult: 1.06, powerMult: 1.02, speedMult: 1.04 },
  { fighter: 'kamen_blade', stage: 6, stageName: 'KUIL SALJU', tierLabel: 'TANTANGAN', hpMult: 1.14, powerMult: 1.1, speedMult: 1.08 },
  { fighter: 'mecha_mouse', stage: 7, stageName: 'RAWA BERACUN', tierLabel: 'SULIT', hpMult: 1.22, powerMult: 1.16, speedMult: 1.12 },
  { fighter: 'kamen_geats', stage: 3, stageName: 'TAKHTA KAISAR', tierLabel: 'MASTER', hpMult: 1.3, powerMult: 1.24, speedMult: 1.16 },
  { fighter: 'key_titan', stage: 8, stageName: 'PUNCAK HALILINTAR', tierLabel: 'ELITE', hpMult: 1.4, powerMult: 1.3, speedMult: 1.2 },
  { fighter: 'virus_rex', stage: 9, stageName: 'GERBANG KUANTUM', tierLabel: 'FINAL BOSS', hpMult: 1.52, powerMult: 1.38, speedMult: 1.24 },
];

interface StoryChapter {
  fighter: FighterId;
  stage: StageId;
  stageName: string;
  chapterTitle: string;
  storyText: string;
  challengerLine: string;
  cutsceneUrl: string;
  cutsceneAccent: string;
}

const STORY_CAMPAIGNS: Record<
  StoryRoute,
  {
    title: string;
    subtitle: string;
    badge: string;
    intro: string;
    endingTitle: string;
    endingText: string;
    stages: StoryChapter[];
  }
> = {
  hero: {
    title: 'HERO ROUTE',
    subtitle: 'Kebangkitan Pelindung Jaringan',
    badge: '4 CHAPTER · PENYELAMATAN SISTEM',
    intro:
      'Gelombang malware membangkitkan monster perangkat keras di seluruh server. Pimpin para Ksatria untuk menghentikan invasi sebelum inti sistem lumpuh!',
    endingTitle: 'PELINDUNG JARINGAN SEJATI!',
    endingText:
      'Trojan Rex dan pasukan monster perangkat berhasil ditaklukkan! Server kembali pulih, jaringan aman terkendali, dan kedamaian dunia digital terjaga.',
    stages: [
      {
        fighter: 'cyber_phone',
        stage: 4,
        stageName: 'LAB SERVER SIBER',
        chapterTitle: 'CHAPTER 1 · GANGGUAN SINYAL 5G',
        storyText:
          'Sinyal liar bertegangan tinggi mulai mengacaukan Lab Server Siber! PHONEX TITAN menghadang di gerbang utama dengan perisai layar AMOLED-nya.',
        challengerLine: '"Frekuensi 5G-ku akan membekukan seluruh jaringan pertahananmu!"',
        cutsceneUrl: storyCyberPhoneUrl,
        cutsceneAccent: '#06b6d4',
      },
      {
        fighter: 'mecha_mouse',
        stage: 7,
        stageName: 'RAWA BERACUN',
        chapterTitle: 'CHAPTER 2 · BAYANGAN SENSOR OPTIK',
        storyText:
          'Di tengah kabut digital beracun, CLICKER FANG melesat dengan kecepatan DPI ekstrem untuk memutus jalur data. Waspadai sergapan laser optiknya!',
        challengerLine: '"Target terkunci di 32.000 DPI... satu klik, kau lenyap!"',
        cutsceneUrl: storyMechaMouseUrl,
        cutsceneAccent: '#84cc16',
      },
      {
        fighter: 'key_titan',
        stage: 8,
        stageName: 'PUNCAK HALILINTAR',
        chapterTitle: 'CHAPTER 3 · BENTENG MEKANIKAL RGB',
        storyText:
          'MECH KEYS GOLEM menjaga gerbang puncak badai petir! Hancurkan pertahanan baja raksasanya sebelum ia melepaskan kombo Ctrl+Alt+Del!',
        challengerLine: '"Tekan satu langkah lagi, dan kombo Ctrl+Alt+Del akan menghapusmu!"',
        cutsceneUrl: storyKeyTitanUrl,
        cutsceneAccent: '#a855f7',
      },
      {
        fighter: 'virus_rex',
        stage: 9,
        stageName: 'GERBANG KUANTUM',
        chapterTitle: 'FINAL BOSS · INTI KORUPSI TROJAN',
        storyText:
          'Di jantung Gerbang Kuantum, sang dalang kekacauan TROJAN REX bangkit! Kalahkan raja virus ini untuk menyelamatkan seluruh sistem!',
        challengerLine: '"Seluruh firewall telah runtuh! Akulah penguasa absolut Gerbang Kuantum!"',
        cutsceneUrl: storyVirusRexUrl,
        cutsceneAccent: '#ef4444',
      },
    ],
  },
  monster: {
    title: 'MONSTER ROUTE',
    subtitle: 'Invasi Overdrive Hardware',
    badge: '4 CHAPTER · DOMINASI SIBER',
    intro:
      'Setelah terkurung di dalam sistem, para Monster Virus & Hardware bangkit menuntut supremasi! Tumbangkan seluruh Ksatria Pelindung menuju Gerbang Kuantum.',
    endingTitle: 'PENGUASA MUTLAK DUNIA DIGITAL!',
    endingText:
      'Seluruh barisan Ksatria Pelindung hingga Ultraman Zero telah bertekuk lutut! Kini pasukan Monster Siber menguasai penuh mainframe Gerbang Kuantum.',
    stages: [
      {
        fighter: 'knight',
        stage: 1,
        stageName: 'KUIL MALAM',
        chapterTitle: 'CHAPTER 1 · RUNTUHNYA ZIRAH PENJAGA',
        storyText:
          'KNIGHT menghadang pelarian pasukan monster di Kuil Malam. Patahkan perisai sayap bajanya untuk membuka jalan menuju menara utama!',
        challengerLine: '"Selama pedang baja ini terhunus, tak satu pun virus boleh lolos!"',
        cutsceneUrl: storyKnightUrl,
        cutsceneAccent: '#3b82f6',
      },
      {
        fighter: 'kamen_geats',
        stage: 3,
        stageName: 'TAKHTA KAISAR',
        chapterTitle: 'CHAPTER 2 · DUEL KOTA TAKHTA',
        storyText:
          'KAMEN GEATS menanti di Aula Naga Merah dengan tembakan meriam Magnum yang presisi. Terobos jarak tembaknya dengan serangan agresif!',
        challengerLine: '"Bersiaplah... panggung ini hanya menyisakan satu pemenang sejati!"',
        cutsceneUrl: storyKamenGeatsUrl,
        cutsceneAccent: '#f97316',
      },
      {
        fighter: 'kamen_blade',
        stage: 6,
        stageName: 'KUIL SALJU',
        chapterTitle: 'CHAPTER 3 · SEGEL KUMBANG KUANTUM',
        storyText:
          'Ksatria Kumbang KAMEN BLADE menjaga segel terakhir di Kuil Salju yang membeku. Hancurkan pedang kuantumnya sebelum Gerbang Kuantum terbuka!',
        challengerLine: '"Royal Straight Flush telah aktif! Jangan harap bisa menembus segel ini!"',
        cutsceneUrl: storyKamenBladeUrl,
        cutsceneAccent: '#38bdf8',
      },
      {
        fighter: 'ultraman_zero',
        stage: 9,
        stageName: 'GERBANG KUANTUM',
        chapterTitle: 'FINAL BOSS · CAHAYA TERAKHIR KOSMIK',
        storyText:
          'ULTRAMAN ZERO turun langsung sebagai benteng terakhir para Hero! Kerahkan seluruh kekuatan overdrive untuk merebut takhta Gerbang Kuantum!',
        challengerLine: '"Kau 20.000 tahun terlalu cepat untuk menantang cahaya kosmikku!"',
        cutsceneUrl: storyUltramanZeroUrl,
        cutsceneAccent: '#38bdf8',
      },
    ],
  },
};

const STORY_CUTSCENE_URLS: string[] = [
  ...STORY_CAMPAIGNS.hero.stages.map((s) => s.cutsceneUrl),
  ...STORY_CAMPAIGNS.monster.stages.map((s) => s.cutsceneUrl),
];

// Cinematic Non-8bit Synthesizer & BGM Engine
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
      const len = Math.floor(this.ctx.sampleRate * 0.35);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
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
        filt.type = 'bandpass';
        filt.frequency.value = type === 'heavy' ? 800 : type === 'kick' ? 1200 : 1600;
        filt.Q.value = 1.2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(type === 'heavy' ? 0.45 : 0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + (type === 'heavy' ? 0.22 : 0.12));
        src.connect(filt);
        filt.connect(g);
        g.connect(ctx.destination);
        src.start(now);
      }
      const osc = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'heavy' ? 140 : 190, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      g2.gain.setValueAtTime(type === 'heavy' ? 0.4 : 0.25, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(g2);
      g2.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'block') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'fireball') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'gong') {
      [92, 138, 184, 230].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      });
    } else if (type === 'ko' || type === 'fatality') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(type === 'fatality' ? 160 : 210, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + (type === 'fatality' ? 1.4 : 0.9));
      g.gain.setValueAtTime(0.42, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (type === 'fatality' ? 1.45 : 0.95));
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    }
  }

  public startBgm() {
    this.stopBgm();
    if (this.muted || typeof window === 'undefined') return;
    const ctx = this.ensure();
    if (!ctx) return;

    // Cinematic rich chord progression & arpeggio synth loop
    const chordRoots = [110, 98, 130.81, 146.83];
    const melodySeq = [220, 261.63, 329.63, 392, 329.63, 261.63, 293.66, 246.94];

    this.step = 0;
    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const beat = (this.step >> 2) % chordRoots.length;
      const root = chordRoots[beat];
      const melodyFreq = melodySeq[this.step % melodySeq.length];

      // Warm Synth Pad
      const pad = this.ctx.createOscillator();
      const padFilt = this.ctx.createBiquadFilter();
      const padGain = this.ctx.createGain();
      pad.type = 'sawtooth';
      pad.frequency.setValueAtTime(root * 0.5, now);
      padFilt.type = 'lowpass';
      padFilt.frequency.setValueAtTime(650, now);
      padGain.gain.setValueAtTime(0.045, now);
      padGain.gain.linearRampToValueAtTime(0.001, now + 0.48);
      pad.connect(padFilt);
      padFilt.connect(padGain);
      padGain.connect(this.ctx.destination);
      pad.start(now);
      pad.stop(now + 0.5);

      // Driving Arpeggio Lead
      const lead = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      lead.type = 'triangle';
      lead.frequency.setValueAtTime(melodyFreq, now);
      leadGain.gain.setValueAtTime(0.035, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      lead.connect(leadGain);
      leadGain.connect(this.ctx.destination);
      lead.start(now);
      lead.stop(now + 0.24);

      // Cinematic Percussion Drum Beat on 0 and 2
      if (this.step % 2 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(130, now);
        kick.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        kickGain.gain.setValueAtTime(0.08, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        kick.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kick.start(now);
        kick.stop(now + 0.15);
      }

      this.step++;
    }, 140);
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
  jumpPending?: boolean;
  wasAirborne?: boolean;
  isLocalPlayer?: boolean;
  remoteTargetX?: number;
  remoteTargetY?: number;
  remoteTargetVx?: number;
  remoteTargetVy?: number;
  remoteTargetPose?: PoseState;
}

type CombatActionName = 'punch' | 'kick' | 'uppercut' | 'sweep' | 'special' | 'fatality' | 'jump';

interface OnlinePlayerSnap {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  facing: 1 | -1;
  pose: PoseState;
  poseTimer: number;
  poseDuration: number;
  isBlocking: boolean;
  isCrouching: boolean;
  attackNonce: number;
  attackAction?: CombatActionName;
  seq?: number;
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
    p2HitSeq?: number;
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
      id?: number;
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
  id?: number;
  createdAtMs?: number;
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
  walkSheet: string;
  jumpSheet: string;
  actionFrames?: Partial<Record<ActionSequenceKey, string[]>>;
}

interface FatalityVariant {
  id: string;
  name: string;
  imageUrl: string;
  accent: string;
}

const FATALITY_POOL: Record<FighterId, FatalityVariant[]> = {
  scorpio: [
    { id: 'scorpio_1', name: 'TOASTY HELLFIRE', imageUrl: fatScorpio1Url, accent: '#f97316' },
    { id: 'scorpio_2', name: 'INFERNO CHAIN SEVER', imageUrl: fatScorpio2Url, accent: '#ef4444' },
    { id: 'scorpio_3', name: 'NETHERREALM SCORCH', imageUrl: fatScorpio3Url, accent: '#f59e0b' },
  ],
  kamen_rider: [
    { id: 'kr_1', name: 'HENSHIN RIDER KICK', imageUrl: fatKamenRider1Url, accent: '#38bdf8' },
    { id: 'kr_2', name: 'DOUBLE CYCLONE CRASH', imageUrl: fatKamenRider2Url, accent: '#22c55e' },
    { id: 'kr_3', name: 'TYPHOON OVERDRIVE', imageUrl: fatKamenRider3Url, accent: '#0ea5e9' },
  ],
  knight: [
    { id: 'knight_1', name: 'FINAL VENT IMPALE', imageUrl: fatKnight1Url, accent: '#3b82f6' },
    { id: 'knight_2', name: 'DARKWING ECLIPSE SLASH', imageUrl: fatKnight2Url, accent: '#6366f1' },
    { id: 'knight_3', name: 'PHANTOM LANCE EXECUTE', imageUrl: fatKnight3Url, accent: '#38bdf8' },
  ],
  bisop: [
    { id: 'bisop_1', name: 'SANCTUARY JUDGMENT', imageUrl: fatBisop1Url, accent: '#fbbf24' },
    { id: 'bisop_2', name: 'CATHEDRAL CRIMSON NOVA', imageUrl: fatBisop2Url, accent: '#ef4444' },
    { id: 'bisop_3', name: 'SACRED DIAGONAL PURGE', imageUrl: fatBisop3Url, accent: '#f59e0b' },
  ],
  queen: [
    { id: 'queen_1', name: 'ROYAL CORONATION FINISHER', imageUrl: fatQueen1Url, accent: '#38bdf8' },
    { id: 'queen_2', name: 'SAPPHIRE SOVEREIGN SLASH', imageUrl: fatQueen2Url, accent: '#fde047' },
    { id: 'queen_3', name: 'CRYSTAL THRONE CRUSH', imageUrl: fatQueen3Url, accent: '#22d3ee' },
  ],
  virus_rex: [
    { id: 'virus_1', name: 'SYSTEM32 CORRUPTION', imageUrl: fatVirusRex1Url, accent: '#22c55e' },
    { id: 'virus_2', name: 'TROJAN ACID ERUPTION', imageUrl: fatVirusRex2Url, accent: '#4ade80' },
    { id: 'virus_3', name: 'MALWARE BINARY SHRED', imageUrl: fatVirusRex3Url, accent: '#ef4444' },
  ],
  kamen_blade: [
    { id: 'blade_1', name: 'ROYAL STRAIGHT FLUSH', imageUrl: fatKamenBlade1Url, accent: '#fbbf24' },
    { id: 'blade_2', name: 'KING FORM LIGHTNING', imageUrl: fatKamenBlade2Url, accent: '#3b82f6' },
    { id: 'blade_3', name: 'FOUR CARDS OBLITERATION', imageUrl: fatKamenBlade3Url, accent: '#eab308' },
  ],
  kamen_geats: [
    { id: 'geats_1', name: 'GODDESS RESET FINISHER', imageUrl: fatKamenGeats1Url, accent: '#ef4444' },
    { id: 'geats_2', name: 'MAGNUM BOOST BARRAGE', imageUrl: fatKamenGeats2Url, accent: '#f97316' },
    { id: 'geats_3', name: 'GRAND VICTORY CANNON', imageUrl: fatKamenGeats3Url, accent: '#38bdf8' },
  ],
  kamen_kabuto: [
    { id: 'kabuto_1', name: 'MAXIMUM RIDER POWER', imageUrl: fatKamenKabuto1Url, accent: '#ef4444' },
    { id: 'kabuto_2', name: 'CLOCK UP HYPER SLASH', imageUrl: fatKamenKabuto2Url, accent: '#38bdf8' },
    { id: 'kabuto_3', name: 'HYPER KABUTO CAST OFF', imageUrl: fatKamenKabuto3Url, accent: '#f97316' },
  ],
  ultraman_nexus: [
    { id: 'nexus_1', name: 'CORE DISINTEGRATION', imageUrl: fatUltramanNexus1Url, accent: '#38bdf8' },
    { id: 'nexus_2', name: 'SCHUMANN ARROW RAY', imageUrl: fatUltramanNexus2Url, accent: '#f43f5e' },
    { id: 'nexus_3', name: 'META-FIELD ANNIHILATION', imageUrl: fatUltramanNexus3Url, accent: '#22d3ee' },
  ],
  ultraman_zero: [
    { id: 'zero_1', name: 'ULTIMATE ZERO SLICE', imageUrl: fatUltramanZero1Url, accent: '#38bdf8' },
    { id: 'zero_2', name: 'TWIN SLUGGER TORNADO', imageUrl: fatUltramanZero2Url, accent: '#fde047' },
    { id: 'zero_3', name: 'WIDE ZERO PLASMA BEAM', imageUrl: fatUltramanZero3Url, accent: '#2563eb' },
  ],
  cyber_phone: [
    { id: 'phone_1', name: '5G OVERLOAD MELTDOWN', imageUrl: fatCyberPhone1Url, accent: '#06b6d4' },
    { id: 'phone_2', name: 'CRACKED SCREEN SHATTER', imageUrl: fatCyberPhone2Url, accent: '#38bdf8' },
    { id: 'phone_3', name: 'NOTIFICATION APOCALYPSE', imageUrl: fatCyberPhone3Url, accent: '#ef4444' },
  ],
  mecha_mouse: [
    { id: 'mouse_1', name: 'OPTICAL LASER DISSECTION', imageUrl: fatMechaMouse1Url, accent: '#ec4899' },
    { id: 'mouse_2', name: 'DPI HYPER-SHRED', imageUrl: fatMechaMouse2Url, accent: '#f43f5e' },
    { id: 'mouse_3', name: 'DOUBLE-CLICK OBLITERATION', imageUrl: fatMechaMouse3Url, accent: '#22d3ee' },
  ],
  key_titan: [
    { id: 'key_1', name: 'CTRL+ALT+DELETE PURGE', imageUrl: fatKeyTitan1Url, accent: '#8b5cf6' },
    { id: 'key_2', name: 'KEYCAP METEOR BARRAGE', imageUrl: fatKeyTitan2Url, accent: '#4ade80' },
    { id: 'key_3', name: 'MECHANICAL SWITCH CRUSH', imageUrl: fatKeyTitan3Url, accent: '#ec4899' },
  ],
};

const FATALITY_DECK_QUEUE: Partial<Record<FighterId, FatalityVariant[]>> = {};
const LAST_FATALITY_BY_FIGHTER: Partial<Record<FighterId, string>> = {};

function getFatalityPool(fighterId: FighterId): FatalityVariant[] {
  return FATALITY_POOL[fighterId] || FATALITY_POOL.scorpio;
}

function getFatalityVariant(fighterId: FighterId, variantId?: string | null): FatalityVariant {
  const pool = getFatalityPool(fighterId);
  if (variantId) {
    const found = pool.find((v) => v.id === variantId);
    if (found) return found;
  }
  return pool[0];
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
    walkSheet: scorpioWalkSheetUrl,
    jumpSheet: scorpioJumpSheetUrl,
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
    walkSheet: kamenRiderWalkSheetUrl,
    jumpSheet: kamenRiderJumpSheetUrl,
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
  kamen_blade: {
    chroma: 'magenta',
    walkSheet: kamenBladeWalkSheetUrl,
    jumpSheet: kamenBladeJumpSheetUrl,
    urls: {
      idle: kamenBladeIdleUrl,
      punch: kamenBladePunchUrl,
      kick: kamenBladeKickUrl,
      uppercut: kamenBladeUppercutUrl,
      crouch: kamenBladeCrouchUrl,
      hit: kamenBladeHitUrl,
      special: kamenBladeSpecialUrl,
      block: kamenBladeBlockUrl,
      fall: kamenBladeFallUrl,
      victory: kamenBladeVictoryUrl,
    },
    actionFrames: {
      punch: [kamenBladeIdleUrl, kamenBladeBlockUrl, kamenBladePunchUrl, kamenBladePunchUrl, kamenBladeBlockUrl, kamenBladeIdleUrl],
      kick: [kamenBladeIdleUrl, kamenBladeCrouchUrl, kamenBladeKickUrl, kamenBladeKickUrl, kamenBladeCrouchUrl, kamenBladeIdleUrl],
      uppercut: [kamenBladeCrouchUrl, kamenBladeCrouchUrl, kamenBladeUppercutUrl, kamenBladeUppercutUrl, kamenBladeBlockUrl, kamenBladeIdleUrl],
      special: [kamenBladeBlockUrl, kamenBladeSpecialUrl, kamenBladeSpecialUrl, kamenBladeSpecialUrl, kamenBladeBlockUrl, kamenBladeIdleUrl],
      sweep: [kamenBladeCrouchUrl, kamenBladeCrouchUrl, kamenBladeKickUrl, kamenBladeKickUrl, kamenBladeCrouchUrl, kamenBladeIdleUrl],
    },
  },
  kamen_geats: {
    chroma: 'magenta',
    walkSheet: kamenGeatsWalkSheetUrl,
    jumpSheet: kamenGeatsJumpSheetUrl,
    urls: {
      idle: kamenGeatsIdleUrl,
      punch: kamenGeatsPunchUrl,
      kick: kamenGeatsKickUrl,
      uppercut: kamenGeatsUppercutUrl,
      crouch: kamenGeatsCrouchUrl,
      hit: kamenGeatsHitUrl,
      special: kamenGeatsSpecialUrl,
      block: kamenGeatsBlockUrl,
      fall: kamenGeatsFallUrl,
      victory: kamenGeatsVictoryUrl,
    },
    actionFrames: {
      punch: [kamenGeatsIdleUrl, kamenGeatsBlockUrl, kamenGeatsPunchUrl, kamenGeatsPunchUrl, kamenGeatsBlockUrl, kamenGeatsIdleUrl],
      kick: [kamenGeatsIdleUrl, kamenGeatsCrouchUrl, kamenGeatsKickUrl, kamenGeatsKickUrl, kamenGeatsCrouchUrl, kamenGeatsIdleUrl],
      uppercut: [kamenGeatsCrouchUrl, kamenGeatsCrouchUrl, kamenGeatsUppercutUrl, kamenGeatsUppercutUrl, kamenGeatsBlockUrl, kamenGeatsIdleUrl],
      special: [kamenGeatsBlockUrl, kamenGeatsSpecialUrl, kamenGeatsSpecialUrl, kamenGeatsSpecialUrl, kamenGeatsBlockUrl, kamenGeatsIdleUrl],
      sweep: [kamenGeatsCrouchUrl, kamenGeatsCrouchUrl, kamenGeatsKickUrl, kamenGeatsKickUrl, kamenGeatsCrouchUrl, kamenGeatsIdleUrl],
    },
  },
  kamen_kabuto: {
    chroma: 'magenta',
    walkSheet: kamenKabutoWalkSheetUrl,
    jumpSheet: kamenKabutoJumpSheetUrl,
    urls: {
      idle: kamenKabutoIdleUrl,
      punch: kamenKabutoPunchUrl,
      kick: kamenKabutoKickUrl,
      uppercut: kamenKabutoUppercutUrl,
      crouch: kamenKabutoCrouchUrl,
      hit: kamenKabutoHitUrl,
      special: kamenKabutoSpecialUrl,
      block: kamenKabutoBlockUrl,
      fall: kamenKabutoFallUrl,
      victory: kamenKabutoVictoryUrl,
    },
    actionFrames: {
      punch: [
        kamenKabutoIdleUrl,
        kamenKabutoPunchWindupUrl,
        kamenKabutoPunchUrl,
        kamenKabutoPunchUrl,
        kamenKabutoPunchWindupUrl,
        kamenKabutoIdleUrl,
      ],
      kick: [
        kamenKabutoIdleUrl,
        kamenKabutoKickChamberUrl,
        kamenKabutoKickUrl,
        kamenKabutoKickUrl,
        kamenKabutoKickChamberUrl,
        kamenKabutoIdleUrl,
      ],
      uppercut: [
        kamenKabutoCrouchUrl,
        kamenKabutoUppercutCoilUrl,
        kamenKabutoUppercutUrl,
        kamenKabutoUppercutUrl,
        kamenKabutoBlockUrl,
        kamenKabutoIdleUrl,
      ],
      special: [
        kamenKabutoSpecialChargeUrl,
        kamenKabutoSpecialChargeUrl,
        kamenKabutoSpecialUrl,
        kamenKabutoSpecialUrl,
        kamenKabutoSpecialChargeUrl,
        kamenKabutoIdleUrl,
      ],
      sweep: [
        kamenKabutoCrouchUrl,
        kamenKabutoKickChamberUrl,
        kamenKabutoKickUrl,
        kamenKabutoKickChamberUrl,
        kamenKabutoCrouchUrl,
        kamenKabutoIdleUrl,
      ],
    },
  },
  ultraman_nexus: {
    chroma: 'magenta',
    walkSheet: ultramanNexusWalkSheetUrl,
    jumpSheet: ultramanNexusJumpSheetUrl,
    urls: {
      idle: ultramanNexusIdleUrl,
      punch: ultramanNexusPunchUrl,
      kick: ultramanNexusKickUrl,
      uppercut: ultramanNexusUppercutUrl,
      crouch: ultramanNexusCrouchUrl,
      hit: ultramanNexusHitUrl,
      special: ultramanNexusSpecialUrl,
      block: ultramanNexusBlockUrl,
      fall: ultramanNexusFallUrl,
      victory: ultramanNexusVictoryUrl,
    },
    actionFrames: {
      punch: [ultramanNexusIdleUrl, ultramanNexusBlockUrl, ultramanNexusPunchUrl, ultramanNexusPunchUrl, ultramanNexusBlockUrl, ultramanNexusIdleUrl],
      kick: [ultramanNexusIdleUrl, ultramanNexusCrouchUrl, ultramanNexusKickUrl, ultramanNexusKickUrl, ultramanNexusCrouchUrl, ultramanNexusIdleUrl],
      uppercut: [ultramanNexusCrouchUrl, ultramanNexusCrouchUrl, ultramanNexusUppercutUrl, ultramanNexusUppercutUrl, ultramanNexusBlockUrl, ultramanNexusIdleUrl],
      special: [ultramanNexusBlockUrl, ultramanNexusSpecialUrl, ultramanNexusSpecialUrl, ultramanNexusSpecialUrl, ultramanNexusBlockUrl, ultramanNexusIdleUrl],
      sweep: [ultramanNexusCrouchUrl, ultramanNexusCrouchUrl, ultramanNexusKickUrl, ultramanNexusKickUrl, ultramanNexusCrouchUrl, ultramanNexusIdleUrl],
    },
  },
  ultraman_zero: {
    chroma: 'magenta',
    walkSheet: ultramanZeroWalkSheetUrl,
    jumpSheet: ultramanZeroJumpSheetUrl,
    urls: {
      idle: ultramanZeroIdleUrl,
      punch: ultramanZeroPunchUrl,
      kick: ultramanZeroKickUrl,
      uppercut: ultramanZeroUppercutUrl,
      crouch: ultramanZeroCrouchUrl,
      hit: ultramanZeroHitUrl,
      special: ultramanZeroSpecialUrl,
      block: ultramanZeroBlockUrl,
      fall: ultramanZeroFallUrl,
      victory: ultramanZeroVictoryUrl,
    },
    actionFrames: {
      punch: [ultramanZeroIdleUrl, ultramanZeroBlockUrl, ultramanZeroPunchUrl, ultramanZeroPunchUrl, ultramanZeroBlockUrl, ultramanZeroIdleUrl],
      kick: [ultramanZeroIdleUrl, ultramanZeroCrouchUrl, ultramanZeroKickUrl, ultramanZeroKickUrl, ultramanZeroCrouchUrl, ultramanZeroIdleUrl],
      uppercut: [ultramanZeroCrouchUrl, ultramanZeroCrouchUrl, ultramanZeroUppercutUrl, ultramanZeroUppercutUrl, ultramanZeroBlockUrl, ultramanZeroIdleUrl],
      special: [ultramanZeroBlockUrl, ultramanZeroSpecialUrl, ultramanZeroSpecialUrl, ultramanZeroSpecialUrl, ultramanZeroBlockUrl, ultramanZeroIdleUrl],
      sweep: [ultramanZeroCrouchUrl, ultramanZeroCrouchUrl, ultramanZeroKickUrl, ultramanZeroKickUrl, ultramanZeroCrouchUrl, ultramanZeroIdleUrl],
    },
  },
  knight: {
    chroma: 'magenta',
    walkSheet: knightWalkSheetUrl,
    jumpSheet: knightJumpSheetUrl,
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
    walkSheet: bisopWalkSheetUrl,
    jumpSheet: bisopJumpSheetUrl,
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
    walkSheet: queenWalkSheetUrl,
    jumpSheet: queenJumpSheetUrl,
    urls: {
      idle: queenIdleUrl,
      punch: queenPunchUrl,
      kick: queenAttackUrl,
      uppercut: queenUppercutUrl,
      crouch: queenCrouchUrl,
      hit: queenHitUrl,
      special: queenSpecialUrl,
      block: queenBlockUrl,
      fall: queenFallUrl,
      victory: queenVictoryUrl,
    },
  },
  virus_rex: {
    chroma: 'magenta',
    walkSheet: virusRexWalkSheetUrl,
    jumpSheet: virusRexJumpSheetUrl,
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
  cyber_phone: {
    chroma: 'magenta',
    walkSheet: cyberPhoneWalkSheetUrl,
    jumpSheet: cyberPhoneJumpSheetUrl,
    urls: {
      idle: cyberPhoneIdleUrl,
      punch: cyberPhonePunchUrl,
      kick: cyberPhoneKickUrl,
      uppercut: cyberPhoneUppercutUrl,
      crouch: cyberPhoneCrouchUrl,
      hit: cyberPhoneHitUrl,
      special: cyberPhoneSpecialUrl,
      block: cyberPhoneBlockUrl,
      fall: cyberPhoneFallUrl,
      victory: cyberPhoneVictoryUrl,
    },
    actionFrames: {
      punch: [cyberPhoneIdleUrl, cyberPhoneBlockUrl, cyberPhonePunchUrl, cyberPhonePunchUrl, cyberPhoneBlockUrl, cyberPhoneIdleUrl],
      kick: [cyberPhoneIdleUrl, cyberPhoneCrouchUrl, cyberPhoneKickUrl, cyberPhoneKickUrl, cyberPhoneCrouchUrl, cyberPhoneIdleUrl],
      uppercut: [cyberPhoneCrouchUrl, cyberPhoneCrouchUrl, cyberPhoneUppercutUrl, cyberPhoneUppercutUrl, cyberPhoneBlockUrl, cyberPhoneIdleUrl],
      special: [cyberPhoneBlockUrl, cyberPhoneSpecialUrl, cyberPhoneSpecialUrl, cyberPhoneSpecialUrl, cyberPhoneBlockUrl, cyberPhoneIdleUrl],
      sweep: [cyberPhoneCrouchUrl, cyberPhoneCrouchUrl, cyberPhoneKickUrl, cyberPhoneKickUrl, cyberPhoneCrouchUrl, cyberPhoneIdleUrl],
    },
  },
  mecha_mouse: {
    chroma: 'magenta',
    walkSheet: mechaMouseWalkSheetUrl,
    jumpSheet: mechaMouseJumpSheetUrl,
    urls: {
      idle: mechaMouseIdleUrl,
      punch: mechaMousePunchUrl,
      kick: mechaMouseKickUrl,
      uppercut: mechaMouseUppercutUrl,
      crouch: mechaMouseCrouchUrl,
      hit: mechaMouseHitUrl,
      special: mechaMouseSpecialUrl,
      block: mechaMouseBlockUrl,
      fall: mechaMouseFallUrl,
      victory: mechaMouseVictoryUrl,
    },
    actionFrames: {
      punch: [mechaMouseIdleUrl, mechaMouseBlockUrl, mechaMousePunchUrl, mechaMousePunchUrl, mechaMouseBlockUrl, mechaMouseIdleUrl],
      kick: [mechaMouseIdleUrl, mechaMouseCrouchUrl, mechaMouseKickUrl, mechaMouseKickUrl, mechaMouseCrouchUrl, mechaMouseIdleUrl],
      uppercut: [mechaMouseCrouchUrl, mechaMouseCrouchUrl, mechaMouseUppercutUrl, mechaMouseUppercutUrl, mechaMouseBlockUrl, mechaMouseIdleUrl],
      special: [mechaMouseBlockUrl, mechaMouseSpecialUrl, mechaMouseSpecialUrl, mechaMouseSpecialUrl, mechaMouseBlockUrl, mechaMouseIdleUrl],
      sweep: [mechaMouseCrouchUrl, mechaMouseCrouchUrl, mechaMouseKickUrl, mechaMouseKickUrl, mechaMouseCrouchUrl, mechaMouseIdleUrl],
    },
  },
  key_titan: {
    chroma: 'magenta',
    walkSheet: keyTitanWalkSheetUrl,
    jumpSheet: keyTitanJumpSheetUrl,
    urls: {
      idle: keyTitanIdleUrl,
      punch: keyTitanPunchUrl,
      kick: keyTitanKickUrl,
      uppercut: keyTitanUppercutUrl,
      crouch: keyTitanCrouchUrl,
      hit: keyTitanHitUrl,
      special: keyTitanSpecialUrl,
      block: keyTitanBlockUrl,
      fall: keyTitanFallUrl,
      victory: keyTitanVictoryUrl,
    },
    actionFrames: {
      punch: [keyTitanIdleUrl, keyTitanBlockUrl, keyTitanPunchUrl, keyTitanPunchUrl, keyTitanBlockUrl, keyTitanIdleUrl],
      kick: [keyTitanIdleUrl, keyTitanCrouchUrl, keyTitanKickUrl, keyTitanKickUrl, keyTitanCrouchUrl, keyTitanIdleUrl],
      uppercut: [keyTitanCrouchUrl, keyTitanCrouchUrl, keyTitanUppercutUrl, keyTitanUppercutUrl, keyTitanBlockUrl, keyTitanIdleUrl],
      special: [keyTitanBlockUrl, keyTitanSpecialUrl, keyTitanSpecialUrl, keyTitanSpecialUrl, keyTitanBlockUrl, keyTitanIdleUrl],
      sweep: [keyTitanCrouchUrl, keyTitanCrouchUrl, keyTitanKickUrl, keyTitanKickUrl, keyTitanCrouchUrl, keyTitanIdleUrl],
    },
  },
};

const FIGHTER_SPRITE_CACHE: Partial<Record<FighterId, Record<SpritePoseKey, HTMLCanvasElement | null>>> = {};
const FIGHTER_ACTION_FRAMES_CACHE: Partial<
  Record<FighterId, Partial<Record<ActionSequenceKey, (HTMLCanvasElement | null)[]>>>
> = {};
const FIGHTER_LOCOMOTION_CACHE: Partial<Record<FighterId, { walk?: HTMLCanvasElement[]; jump?: HTMLCanvasElement[] }>> =
  {};
const KEYED_SHEET_CACHE = new Map<string, HTMLCanvasElement[]>();
const INFLIGHT_SHEET_LOADS = new Map<string, Promise<HTMLCanvasElement[]>>();
const KEYED_URL_CACHE = new Map<string, HTMLCanvasElement>();
const INFLIGHT_URL_LOADS = new Map<string, Promise<HTMLCanvasElement | null>>();
const FATALITY_IMAGE_CACHE = new Map<string, HTMLImageElement>();
const INFLIGHT_RAW_IMAGE_LOADS = new Map<string, Promise<void>>();

const ARENA_BG_CACHE: Partial<Record<StageId, HTMLCanvasElement>> = {};
const INFLIGHT_ARENA_LOADS = new Map<StageId, Promise<void>>();
let allAssetsInitialized = false;
let assetLoadedCount = 0;
let assetTotalCount = 0;
const spriteProgressListeners = new Set<(info: { loaded: number; total: number; percent: number }) => void>();
const countedAssetDone = new Set<string>();

function computeAssetPercent(loaded: number, total: number) {
  if (total <= 0) return 100;
  return Math.min(100, Math.round((loaded / total) * 100));
}

function notifySpriteProgress() {
  const info = {
    loaded: assetLoadedCount,
    total: assetTotalCount,
    percent: computeAssetPercent(assetLoadedCount, assetTotalCount),
  };
  spriteProgressListeners.forEach((cb) => cb(info));
}

function getSpriteLoadStatus() {
  return {
    loaded: assetLoadedCount,
    total: assetTotalCount,
    percent: computeAssetPercent(assetLoadedCount, assetTotalCount),
  };
}

function subscribeSpriteLoadProgress(cb: (info: { loaded: number; total: number; percent: number }) => void) {
  spriteProgressListeners.add(cb);
  cb(getSpriteLoadStatus());
  return () => {
    spriteProgressListeners.delete(cb);
  };
}

function markAssetDone(uniqKey: string) {
  if (!countedAssetDone.has(uniqKey)) {
    countedAssetDone.add(uniqKey);
    assetLoadedCount = countedAssetDone.size;
    notifySpriteProgress();
  }
}

function preloadRawImage(url: string, highPriority = false): Promise<void> {
  if (typeof window === 'undefined' || !url) return Promise.resolve();
  if (FATALITY_IMAGE_CACHE.has(url)) return Promise.resolve();
  const existing = INFLIGHT_RAW_IMAGE_LOADS.get(url);
  if (existing) return existing;

  const p = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    if (highPriority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = url;
    const done = () => {
      if (img.naturalWidth > 0) FATALITY_IMAGE_CACHE.set(url, img);
      markAssetDone(`raw:${url}`);
      resolve();
    };
    if (typeof img.decode === 'function') {
      img.decode().then(done).catch(() => {
        if (img.complete && img.naturalWidth > 0) done();
        else {
          markAssetDone(`raw:${url}`);
          resolve();
        }
      });
    } else {
      img.onload = done;
      img.onerror = () => {
        markAssetDone(`raw:${url}`);
        resolve();
      };
    }
  });

  INFLIGHT_RAW_IMAGE_LOADS.set(url, p);
  return p;
}

function prewarmFatalityImages(fid: FighterId) {
  if (typeof window === 'undefined') return;
  getFatalityPool(fid).forEach((v) => preloadRawImage(v.imageUrl, true));
}

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
        markAssetDone(`arena:${stageNum}`);
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
      markAssetDone(`arena:${stageNum}`);
      resolve();
    };

    if (typeof img.decode === 'function') {
      img.decode().then(bake).catch(() => {
        if (img.complete && img.naturalWidth > 0) bake();
        else {
          markAssetDone(`arena:${stageNum}`);
          resolve();
        }
      });
    } else {
      img.onload = bake;
      img.onerror = () => {
        markAssetDone(`arena:${stageNum}`);
        resolve();
      };
    }
  });

  INFLIGHT_ARENA_LOADS.set(stageNum, prom);
  return prom;
}

function ensureArenaBackgroundsLoaded() {
  ensureAllGameAssetsLoaded();
}

function applyChromaKeyBuffer(d: Uint8ClampedArray, w: number, h: number, chroma: ChromaMode) {
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  const isDarkBg = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    const r = d[idx];
    const g = d[idx + 1];
    const b = d[idx + 2];
    if (chroma === 'green') {
      const maxRB = r > b ? r : b;
      return (g - maxRB >= 22 && g > r * 1.12 && g > b * 1.12) || (r < 25 && g < 25 && b < 25);
    } else if (chroma === 'magenta') {
      const minRB = r < b ? r : b;
      return (minRB - g >= 25 && r > g * 1.12 && b > g * 1.12) || (r < 25 && g < 25 && b < 25);
    } else {
      return r < 25 && g < 25 && b < 25;
    }
  };

  for (let x = 0; x < w; x++) {
    if (isDarkBg(x, 0)) { visited[x] = 1; queue.push(x); }
    if (isDarkBg(x, h - 1)) { const pos = (h - 1) * w + x; if (!visited[pos]) { visited[pos] = 1; queue.push(pos); } }
  }
  for (let y = 0; y < h; y++) {
    if (isDarkBg(0, y)) { const pos = y * w; if (!visited[pos]) { visited[pos] = 1; queue.push(pos); } }
    if (isDarkBg(w - 1, y)) { const pos = y * w + (w - 1); if (!visited[pos]) { visited[pos] = 1; queue.push(pos); } }
  }

  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const x = pos % w;
    const y = Math.floor(pos / w);
    const idx = (y * w + x) * 4;
    d[idx + 3] = 0;

    const neighbors = [
      { nx: x + 1, ny: y },
      { nx: x - 1, ny: y },
      { nx: x, ny: y + 1 },
      { nx: x, ny: y - 1 },
    ];
    for (const { nx, ny } of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const npos = ny * w + nx;
        if (!visited[npos]) {
          visited[npos] = 1;
          if (isDarkBg(nx, ny)) {
            queue.push(npos);
          }
        }
      }
    }
  }

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (rowOffset + x) * 4;
      if (d[idx + 3] > 28) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { minX, minY, maxX, maxY };
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
  const { minX, minY, maxX, maxY } = applyChromaKeyBuffer(imgData.data, w, h, chroma);

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

function keyAndSliceSpriteSheet(
  img: HTMLImageElement,
  chroma: ChromaMode,
  kind: 'walk' | 'jump'
): HTMLCanvasElement[] {
  const rawW = img.naturalWidth;
  const rawH = img.naturalHeight;
  if (!rawW || !rawH) return [];

  const scale = Math.min(1, 600 / Math.max(rawW, rawH));
  const w = Math.max(6, Math.round(rawW * scale));
  const h = Math.max(4, Math.round(rawH * scale));

  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!tctx) return [];

  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(img, 0, 0, w, h);

  const imgData = tctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  applyChromaKeyBuffer(d, w, h, chroma);

  // Scrub any residual grid divider lines (horizontal mid-gap bars or vertical margin-spanning borders)
  for (let y = 0; y < h; y++) {
    let rowOp = 0;
    const rowOff = y * w;
    for (let x = 0; x < w; x++) {
      if (d[(rowOff + x) * 4 + 3] > 28) rowOp++;
    }
    if (rowOp > w * 0.72) {
      for (let yy = Math.max(0, y - 1); yy <= Math.min(h - 1, y + 1); yy++) {
        const yyOff = yy * w;
        for (let x = 0; x < w; x++) d[(yyOff + x) * 4 + 3] = 0;
      }
    }
  }
  const topBandEnd = Math.max(4, Math.floor(h * 0.06));
  const botBandStart = Math.min(h - 4, Math.floor(h * 0.94));
  for (let x = 0; x < w; x++) {
    let topHits = 0;
    let botHits = 0;
    let colHits = 0;
    for (let y = 0; y < h; y++) {
      if (d[(y * w + x) * 4 + 3] > 28) {
        colHits++;
        if (y < topBandEnd) topHits++;
        else if (y >= botBandStart) botHits++;
      }
    }
    if (colHits > h * 0.76 || (topHits >= 3 && botHits >= 3)) {
      for (let xx = Math.max(0, x - 2); xx <= Math.min(w - 1, x + 2); xx++) {
        for (let y = 0; y < h; y++) d[(y * w + xx) * 4 + 3] = 0;
      }
    }
  }
  tctx.putImageData(imgData, 0, 0);

  // Locate horizontal gap splitting row 1 and row 2
  const ySearchMin = Math.floor(h * 0.36);
  const ySearchMax = Math.floor(h * 0.64);
  let splitY = Math.floor(h * 0.5);
  let bestScore = Infinity;

  for (let y = ySearchMin; y <= ySearchMax; y++) {
    let sum = 0;
    const rowOff = y * w;
    for (let x = 0; x < w; x++) {
      if (d[(rowOff + x) * 4 + 3] > 28) sum++;
    }
    const distCenter = Math.abs(y - h * 0.5) * 0.05;
    if (sum + distCenter < bestScore) {
      bestScore = sum + distCenter;
      splitY = y;
    }
  }

  const cropBandRegion = (x0: number, x1: number, y0: number, y1: number): HTMLCanvasElement | null => {
    let minX = x1;
    let maxX = x0;
    let minY = y1;
    let maxY = y0;
    for (let y = y0; y < y1; y++) {
      const rowOff = y * w;
      for (let x = x0; x < x1; x++) {
        if (d[(rowOff + x) * 4 + 3] > 28) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return null;
    const cw = maxX - minX + 1;
    const ch = maxY - minY + 1;
    const cell = document.createElement('canvas');
    cell.width = cw;
    cell.height = ch;
    const cctx = cell.getContext('2d');
    if (!cctx) return null;
    cctx.drawImage(tmp, minX, minY, cw, ch, 0, 0, cw, ch);
    return cell;
  };

  const splitWideSegment = (seg: { x0: number; x1: number; mass: number }, colHits: Uint16Array) => {
    const segW = seg.x1 - seg.x0;
    if (segW < w * 0.36) return [seg];
    // Split wide merged segment at lowest vertical pixel-mass valley near its center
    const sMin = seg.x0 + Math.floor(segW * 0.35);
    const sMax = seg.x0 + Math.floor(segW * 0.65);
    let bestX = Math.floor((seg.x0 + seg.x1) * 0.5);
    let minV = Infinity;
    for (let x = sMin; x <= sMax; x++) {
      if (colHits[x] < minV) {
        minV = colHits[x];
        bestX = x;
      }
    }
    return [
      { x0: seg.x0, x1: bestX, mass: Math.floor(seg.mass * 0.5) },
      { x0: bestX + 1, x1: seg.x1, mass: Math.floor(seg.mass * 0.5) },
    ];
  };

  const detectRowCells = (y0: number, y1: number, fallbackCols = 3): HTMLCanvasElement[] => {
    const colHits = new Uint16Array(w);
    for (let y = y0; y < y1; y++) {
      const rowOff = y * w;
      for (let x = 0; x < w; x++) {
        if (d[(rowOff + x) * 4 + 3] > 28) colHits[x]++;
      }
    }

    const rawSegs: { x0: number; x1: number; mass: number }[] = [];
    let inSeg = false;
    let segStart = 0;
    let segMass = 0;
    for (let x = 0; x < w; x++) {
      if (colHits[x] > 1) {
        if (!inSeg) {
          inSeg = true;
          segStart = x;
          segMass = 0;
        }
        segMass += colHits[x];
      } else if (inSeg) {
        rawSegs.push({ x0: segStart, x1: x, mass: segMass });
        inSeg = false;
      }
    }
    if (inSeg) rawSegs.push({ x0: segStart, x1: w, mass: segMass });

    // Merge tiny internal gaps inside one fighter (legs, weapon, cape)
    const maxGap = Math.max(5, Math.round(w * 0.013));
    const merged: { x0: number; x1: number; mass: number }[] = [];
    for (const seg of rawSegs) {
      const prev = merged[merged.length - 1];
      if (prev && seg.x0 - prev.x1 <= maxGap) {
        prev.x1 = seg.x1;
        prev.mass += seg.mass;
      } else {
        merged.push({ ...seg });
      }
    }

    const valid = merged
      .filter((s) => s.x1 - s.x0 >= w * 0.06 && s.mass >= 45)
      .flatMap((s) => splitWideSegment(s, colHits));

    if (valid.length >= 3 && valid.length <= 4) {
      return valid
        .map((s) => cropBandRegion(s.x0, s.x1, y0, y1))
        .filter((c): c is HTMLCanvasElement => Boolean(c));
    }

    // Valley-guided fallback division (never merges two sprites into one frame)
    const cuts = [0];
    for (let c = 1; c < fallbackCols; c++) {
      const target = Math.floor((c * w) / fallbackCols);
      const searchMin = Math.max(cuts[cuts.length - 1] + 20, target - Math.floor(w * 0.07));
      const searchMax = Math.min(w - 20, target + Math.floor(w * 0.07));
      let bestCut = target;
      let minMass = Infinity;
      for (let x = searchMin; x <= searchMax; x++) {
        if (colHits[x] < minMass) {
          minMass = colHits[x];
          bestCut = x;
        }
      }
      cuts.push(bestCut);
    }
    cuts.push(w);

    const out: HTMLCanvasElement[] = [];
    for (let c = 0; c < fallbackCols; c++) {
      const cropped = cropBandRegion(cuts[c], cuts[c + 1], y0, y1);
      if (cropped) out.push(cropped);
    }
    return out;
  };

  const topCells = detectRowCells(0, splitY, 3);
  const botCells = detectRowCells(splitY, h, topCells.length === 4 ? 4 : 3);
  const allCells = [...topCells, ...botCells];

  if (allCells.length === 8) {
    // 4x2 sheets cleanly map to 6 distinct walk or 2+2+2 jump frames
    return kind === 'jump'
      ? [allCells[0], allCells[1], allCells[2], allCells[4], allCells[5], allCells[6]]
      : [allCells[0], allCells[1], allCells[3], allCells[4], allCells[5], allCells[7]];
  }

  return allCells.slice(0, 6);
}

function loadAndSliceSpriteSheetUrl(
  url: string,
  chroma: ChromaMode,
  kind: 'walk' | 'jump',
  highPriority = false
): Promise<HTMLCanvasElement[]> {
  const cacheKey = `sheet:${kind}:${chroma}:${url}`;
  const cached = KEYED_SHEET_CACHE.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const existing = INFLIGHT_SHEET_LOADS.get(cacheKey);
  if (existing) return existing;

  const p = new Promise<HTMLCanvasElement[]>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    if (highPriority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = url;

    const finalize = () => {
      const frames = keyAndSliceSpriteSheet(img, chroma, kind);
      if (frames.length > 0) KEYED_SHEET_CACHE.set(cacheKey, frames);
      resolve(frames);
    };

    if (typeof img.decode === 'function') {
      img
        .decode()
        .then(finalize)
        .catch(() => {
          if (img.complete && img.naturalWidth > 0) finalize();
          else resolve([]);
        });
    } else {
      img.onload = finalize;
      img.onerror = () => resolve([]);
    }
  });

  INFLIGHT_SHEET_LOADS.set(cacheKey, p);
  return p;
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
  markAssetDone(`${chroma}:${url}`);
}

function prioritizeFighterSprites(fid: FighterId) {
  if (typeof window === 'undefined') return;
  const cfg = FIGHTER_SPRITE_CONFIG[fid];
  if (!cfg) return;
  if (!FIGHTER_SPRITE_CACHE[fid]) FIGHTER_SPRITE_CACHE[fid] = emptySpritePoseRecord();
  if (!FIGHTER_LOCOMOTION_CACHE[fid]) FIGHTER_LOCOMOTION_CACHE[fid] = {};

  (Object.keys(cfg.urls) as SpritePoseKey[]).forEach((poseKey) => {
    const url = cfg.urls[poseKey];
    loadAndKeySpriteUrl(url, cfg.chroma, true).then((canvas) => {
      const cache = FIGHTER_SPRITE_CACHE[fid];
      if (cache && canvas) cache[poseKey] = canvas;
      markSpriteDone(cfg.chroma, url);
    });
  });

  loadAndSliceSpriteSheetUrl(cfg.walkSheet, cfg.chroma, 'walk', true).then((frames) => {
    if (frames.length > 0 && FIGHTER_LOCOMOTION_CACHE[fid]) {
      FIGHTER_LOCOMOTION_CACHE[fid]!.walk = frames;
    }
    markAssetDone(`sheet:walk:${cfg.chroma}:${cfg.walkSheet}`);
  });

  loadAndSliceSpriteSheetUrl(cfg.jumpSheet, cfg.chroma, 'jump', true).then((frames) => {
    if (frames.length > 0 && FIGHTER_LOCOMOTION_CACHE[fid]) {
      FIGHTER_LOCOMOTION_CACHE[fid]!.jump = frames;
    }
    markAssetDone(`sheet:jump:${cfg.chroma}:${cfg.jumpSheet}`);
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

function ensureAllGameAssetsLoaded() {
  if (allAssetsInitialized || typeof window === 'undefined') return;
  allAssetsInitialized = true;

  const uniqueKeys = new Set<string>();
  const priorityQueue: (() => Promise<void>)[] = [];
  const standardQueue: (() => Promise<void>)[] = [];

  // 1. Menu Banner & Primary Arena (highest priority)
  uniqueKeys.add(`raw:${menuBannerUrl}`);
  priorityQueue.push(() => preloadRawImage(menuBannerUrl, true));

  ARENAS.forEach((arena) => {
    uniqueKeys.add(`arena:${arena.id}`);
    if (arena.id === 1) {
      priorityQueue.push(() => prioritizeArenaBackground(arena.id));
    } else {
      standardQueue.push(() => prioritizeArenaBackground(arena.id));
    }
  });

  // 2. All Fighter Poses, 6-Frame Walk/Jump Sheets, and Action Frames (deduplicated)
  const fighterIds = Object.keys(FIGHTER_SPRITE_CONFIG) as FighterId[];
  fighterIds.forEach((fid) => {
    const cfg = FIGHTER_SPRITE_CONFIG[fid];
    if (!cfg) return;
    if (!FIGHTER_SPRITE_CACHE[fid]) FIGHTER_SPRITE_CACHE[fid] = emptySpritePoseRecord();
    if (!FIGHTER_LOCOMOTION_CACHE[fid]) FIGHTER_LOCOMOTION_CACHE[fid] = {};

    (Object.keys(cfg.urls) as SpritePoseKey[]).forEach((poseKey) => {
      const url = cfg.urls[poseKey];
      const uniqKey = `${cfg.chroma}:${url}`;
      const isPortraitPose = poseKey === 'idle' || poseKey === 'victory';
      if (uniqueKeys.has(uniqKey)) {
        // Still populate pose pointer when sharing a URL (e.g., virus_rex crouch/hit)
        standardQueue.push(() =>
          loadAndKeySpriteUrl(url, cfg.chroma, false).then((canvas) => {
            const cache = FIGHTER_SPRITE_CACHE[fid];
            if (cache && canvas) cache[poseKey] = canvas;
          })
        );
        return;
      }
      uniqueKeys.add(uniqKey);

      const task = () =>
        loadAndKeySpriteUrl(url, cfg.chroma, isPortraitPose).then((canvas) => {
          const cache = FIGHTER_SPRITE_CACHE[fid];
          if (cache && canvas) cache[poseKey] = canvas;
          markSpriteDone(cfg.chroma, url);
        });

      if (isPortraitPose) priorityQueue.push(task);
      else standardQueue.push(task);
    });

    const walkKey = `sheet:walk:${cfg.chroma}:${cfg.walkSheet}`;
    uniqueKeys.add(walkKey);
    standardQueue.push(() =>
      loadAndSliceSpriteSheetUrl(cfg.walkSheet, cfg.chroma, 'walk', false).then((frames) => {
        if (frames.length > 0 && FIGHTER_LOCOMOTION_CACHE[fid]) {
          FIGHTER_LOCOMOTION_CACHE[fid]!.walk = frames;
        }
        markAssetDone(walkKey);
      })
    );

    const jumpKey = `sheet:jump:${cfg.chroma}:${cfg.jumpSheet}`;
    uniqueKeys.add(jumpKey);
    standardQueue.push(() =>
      loadAndSliceSpriteSheetUrl(cfg.jumpSheet, cfg.chroma, 'jump', false).then((frames) => {
        if (frames.length > 0 && FIGHTER_LOCOMOTION_CACHE[fid]) {
          FIGHTER_LOCOMOTION_CACHE[fid]!.jump = frames;
        }
        markAssetDone(jumpKey);
      })
    );

    if (cfg.actionFrames) {
      if (!FIGHTER_ACTION_FRAMES_CACHE[fid]) FIGHTER_ACTION_FRAMES_CACHE[fid] = {};
      const seqCache = FIGHTER_ACTION_FRAMES_CACHE[fid]!;
      (Object.keys(cfg.actionFrames) as ActionSequenceKey[]).forEach((seqKey) => {
        const urls = cfg.actionFrames![seqKey];
        if (!urls) return;
        if (!seqCache[seqKey]) seqCache[seqKey] = new Array(urls.length).fill(null);
        urls.forEach((url, frameIdx) => {
          const uniqKey = `${cfg.chroma}:${url}`;
          const isNew = !uniqueKeys.has(uniqKey);
          uniqueKeys.add(uniqKey);
          standardQueue.push(() =>
            loadAndKeySpriteUrl(url, cfg.chroma, false).then((canvas) => {
              if (canvas) seqCache[seqKey]![frameIdx] = canvas;
              if (isNew) markSpriteDone(cfg.chroma, url);
            })
          );
        });
      });
    }
  });

  // 3. All 39 Exclusive Fatality Artworks + 8 Story Route Animated Cutscenes
  PLAYABLE_IDS.forEach((fid) => {
    getFatalityPool(fid).forEach((v) => {
      const uniqKey = `raw:${v.imageUrl}`;
      uniqueKeys.add(uniqKey);
      standardQueue.push(() => preloadRawImage(v.imageUrl, false));
    });
  });

  STORY_CUTSCENE_URLS.forEach((url) => {
    const uniqKey = `raw:${url}`;
    if (!uniqueKeys.has(uniqKey)) {
      uniqueKeys.add(uniqKey);
      standardQueue.push(() => preloadRawImage(url, false));
    }
  });

  assetTotalCount = uniqueKeys.size;
  assetLoadedCount = countedAssetDone.size;
  notifySpriteProgress();

  // High-throughput sliding-window worker pool (20 concurrent workers, zero wave-blocking)
  const queue = [...priorityQueue, ...standardQueue];
  let cursor = 0;
  const concurrency = Math.min(20, queue.length || 1);

  const runWorker = async () => {
    while (cursor < queue.length) {
      const fn = queue[cursor++];
      await fn();
    }
  };

  for (let i = 0; i < concurrency; i++) {
    runWorker();
  }
}

function ensureFighterSpritesLoaded() {
  ensureAllGameAssetsLoaded();
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
  } else if (fid === 'kamen_kabuto') {
    // Clock Up Tachyon Crimson Rings & Cyan Plasma Sparks
    for (let i = 0; i < 4; i++) {
      const h = ((time * 0.16 + i * 30) % 120);
      const alpha = 1 - h / 120;
      ctx.strokeStyle = i % 2 === 0 ? `rgba(239, 68, 68, ${alpha * 0.8})` : `rgba(56, 189, 248, ${alpha * 0.78})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -h, 22 + h * 0.2, 7.5, -0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (fid === 'kamen_rider' || fid === 'kamen_blade' || fid === 'kamen_geats') {
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
  } else if (fid === 'ultraman_nexus' || fid === 'ultraman_zero') {
    // Ultraman Plasma Light Aura
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -68, 48 + Math.sin(time * 0.02) * 5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (fid === 'cyber_phone') {
    // 5G Holographic Wi-Fi Waves & Cyan Shield Aura
    for (let i = 0; i < 3; i++) {
      const r = 24 + ((time * 0.08 + i * 18) % 54);
      const a = 1 - r / 78;
      ctx.strokeStyle = `rgba(6, 182, 212, ${a * 0.75})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -78, r, -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.stroke();
    }
  } else if (fid === 'mecha_mouse') {
    // Pink Optical Sensor Crosshair & DPI Trail Rings
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.72)';
    ctx.lineWidth = 2;
    const rotA = time * 0.005;
    ctx.beginPath();
    ctx.arc(0, -68, 44, rotA, rotA + Math.PI * 1.4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.beginPath();
    ctx.arc(0, -68, 32, -rotA, -rotA + Math.PI * 1.2);
    ctx.stroke();
  } else if (fid === 'key_titan') {
    // RGB Mechanical Keycap Aura Pillars
    const colors = ['rgba(139, 92, 246, 0.5)', 'rgba(74, 222, 128, 0.5)', 'rgba(236, 72, 153, 0.5)'];
    for (let i = -1; i <= 1; i++) {
      const h = 85 + Math.sin(time * 0.015 + i * 2) * 20;
      ctx.fillStyle = colors[i + 1];
      ctx.fillRect(i * 28 - 8, -h, 16, h);
    }
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
    ctx.fillStyle = p.suitDark;
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
    const haX = side * 21;
    const haY = -56;
    drawTaperedMuscle(ctx, shX, shY, elX, elY, 7.2, 5.5, armBase, armHi, armSh);
    drawTaperedMuscle(ctx, elX, elY, haX, haY, 5.5, 4.5, armBase, armHi, armSh);
    ctx.fillStyle = p.primary;
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
  }

  // Waist Sash & Tabard
  ctx.fillStyle = p.secondary;
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

    const walkFrames = FIGHTER_LOCOMOTION_CACHE[p.id]?.walk;
    const jumpFrames = FIGHTER_LOCOMOTION_CACHE[p.id]?.jump;
    let locomotionSprite: HTMLCanvasElement | null = null;
    let jumpFrameIdx = -1;

    if (f.pose === 'walk' && walkFrames && walkFrames.length > 0 && !isPortrait) {
      const wIdx = Math.floor(((Math.abs(f.walkPhase) * 1.45) % walkFrames.length + walkFrames.length) % walkFrames.length);
      locomotionSprite = walkFrames[wIdx] || null;
    } else if ((f.pose === 'jump' || f.pose === 'jump_land') && jumpFrames && jumpFrames.length >= 6 && !isPortrait) {
      if (f.pose === 'jump_land') {
        jumpFrameIdx = prog < 0.5 ? 4 : 5;
      } else if (f.jumpPending || (f.y >= GROUND_Y - 3 && f.vy >= -0.5)) {
        // 2 pre-jump frames while coiling & pushing off
        jumpFrameIdx = prog < 0.5 ? 0 : 1;
      } else {
        // 2 airborne jump frames (rising vs apex/descent)
        jumpFrameIdx = f.vy < -1.5 ? 2 : 3;
      }
      locomotionSprite = jumpFrames[jumpFrameIdx] || null;
    }

    const sprite =
      activeActionSprite ||
      locomotionSprite ||
      spriteCache[poseKey] ||
      (poseKey === 'fall' ? spriteCache.hit : null) ||
      spriteCache.idle;
    if (sprite) {
      const baseH = isPortrait ? 116 : 124;
      let targetH = baseH;
      const spriteAspect = sprite.width / Math.max(1, sprite.height);
      let targetW = targetH * spriteAspect;

      let offsetX = 0;
      let offsetY = 0;
      let rot = 0;
      let sx = 1;
      let sy = 1;
      let drawAfterimage = false;

      if (f.pose === 'ko' || f.pose === 'knockdown') {
        if (hasDedicatedFall && poseKey === 'fall') {
          // Dedicated horizontal knocked-out sprite anchored flat on the stage floor
          targetW = isPortrait ? 132 : 148;
          targetH = Math.min(82, Math.max(46, targetW * (sprite.height / sprite.width)));
        } else {
          // Fallback rotation only if fallen sprite hasn't finished decoding
          ctx.translate(0, -16);
          ctx.rotate(-Math.PI / 2);
          ctx.translate(0, 44);
        }
      } else if (jumpFrameIdx >= 0) {
        const jumpHeightScale = [0.80, 0.98, 0.89, 0.92, 0.82, 0.97][jumpFrameIdx] ?? 0.94;
        targetH = Math.round(baseH * jumpHeightScale);
        targetW = targetH * spriteAspect;
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
        } else if (
          p.id === 'kamen_blade' ||
          p.id === 'kamen_geats' ||
          p.id === 'kamen_kabuto' ||
          p.id === 'ultraman_nexus' ||
          p.id === 'ultraman_zero' ||
          p.id === 'cyber_phone' ||
          p.id === 'mecha_mouse' ||
          p.id === 'key_titan'
        ) {
          if (actionFrameIdx === 0 || actionFrameIdx === 1) {
            targetH = Math.round(baseH * 0.78);
          } else if (actionFrameIdx === 2 || actionFrameIdx === 3) {
            targetH = Math.round(baseH * 1.1);
          } else {
            targetH = baseH;
          }
        } else {
          // Calibrated uppercut height so Queen / Knight / Bisop head & body remain true to idle proportions
          targetH = Math.round(baseH * (hasDedicatedUppercut ? 1.09 : 1.1));
        }
        targetW = targetH * spriteAspect;
      } else if (poseKey === 'crouch') {
        targetH = Math.round(baseH * (hasDedicatedCrouch ? 0.75 : 0.68));
        targetW = targetH * spriteAspect;
        offsetY = hasDedicatedCrouch ? 2 : 16;
      } else if (
        (f.pose === 'kick' || f.pose === 'jump_kick' || f.pose === 'sweep') &&
        (p.id === 'kamen_blade' ||
          p.id === 'kamen_geats' ||
          p.id === 'kamen_kabuto' ||
          p.id === 'ultraman_nexus' ||
          p.id === 'ultraman_zero' ||
          p.id === 'cyber_phone' ||
          p.id === 'mecha_mouse' ||
          p.id === 'key_titan') &&
        (actionFrameIdx === 1 || actionFrameIdx === 4 || (f.pose === 'sweep' && actionFrameIdx === 0))
      ) {
        // Crouch windup/recovery frames inside kick & sweep sequences stay crouched cleanly
        targetH = Math.round(baseH * 0.76);
        targetW = targetH * spriteAspect;
      } else if ((poseKey === 'kick' || poseKey === 'special') && spriteAspect > 1.08) {
        // Normalize horizontal flying kick / wide lunging sprites so head & torso never balloon larger than idle
        const maxWideW = isPortrait ? 128 : 138;
        if (targetW > maxWideW) {
          targetW = maxWideW;
          targetH = Math.round(targetW / spriteAspect);
        }
      }

      if (f.pose === 'idle') {
        const breath = Math.sin(time * 0.008);
        sy = 1 + breath * 0.022;
        sx = 1 - breath * 0.012;
        offsetX = Math.sin(time * 0.004) * 1.6;
      } else if (f.pose === 'walk') {
        if (locomotionSprite) {
          offsetY = Math.sin(f.walkPhase * 2) * 1.5;
        } else {
          const strideWave = Math.sin(f.walkPhase);
          offsetY = -Math.abs(strideWave) * 6.5;
          rot = strideWave * 0.055 + 0.04;
          sx = 1 + Math.abs(strideWave) * 0.03;
        }
      } else if (f.pose === 'jump' || f.pose === 'jump_land') {
        if (!locomotionSprite) {
          sy = 1.07;
          sx = 0.94;
          rot = 0.08;
        }
      } else if (f.pose === 'crouch') {
        if (hasDedicatedCrouch) {
          sx = 1.04;
          sy = 0.98;
          offsetY = 2;
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

      // High-Impact Layered Arcade Combat VFX Overlays
      if (f.pose === 'uppercut') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const uGrad = ctx.createRadialGradient(34, -104, 6, 34, -104, 52);
        uGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
        uGrad.addColorStop(0.35, p.primaryLight);
        uGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.strokeStyle = uGrad;
        ctx.lineCap = 'round';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(28, -96, 46, -Math.PI * 0.85, Math.PI * 0.12);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(30, -98, 44, -Math.PI * 0.78, Math.PI * 0.06);
        ctx.stroke();
        ctx.restore();
      } else if (f.pose === 'hit' && !isPortrait) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const hGrad = ctx.createRadialGradient(8, -74, 2, 8, -74, 34);
        hGrad.addColorStop(0, '#ffffff');
        hGrad.addColorStop(0.4, '#fde047');
        hGrad.addColorStop(0.75, 'rgba(239, 68, 68, 0.75)');
        hGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const ang = (i * Math.PI) / 6 + time * 0.02;
          const r = i % 2 === 0 ? 32 : 12;
          if (i === 0) ctx.moveTo(8 + Math.cos(ang) * r, -74 + Math.sin(ang) * r);
          else ctx.lineTo(8 + Math.cos(ang) * r, -74 + Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (f.pose === 'punch' || f.pose === 'kick' || f.pose === 'jump_kick') {
        const activeSlash = prog > 0.16 && prog < 0.88;
        if (activeSlash) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const tx = f.pose === 'punch' ? 58 : 68;
          const ty = f.pose === 'punch' ? -84 : -74;
          const coneGrad = ctx.createLinearGradient(tx - 46, ty, tx + 18, ty);
          coneGrad.addColorStop(0, 'rgba(255,255,255,0)');
          coneGrad.addColorStop(0.55, p.primaryLight);
          coneGrad.addColorStop(1, '#ffffff');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(tx - 44, ty - 11);
          ctx.quadraticCurveTo(tx + 4, ty - 6, tx + 16, ty);
          ctx.quadraticCurveTo(tx + 4, ty + 6, tx - 44, ty + 11);
          ctx.closePath();
          ctx.fill();

          const ringR = 8 + Math.sin(prog * Math.PI) * 14;
          ctx.strokeStyle = p.primaryLight;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(tx + 8, ty, ringR * 0.45, ringR, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (f.pose === 'sweep') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const swGrad = ctx.createLinearGradient(-10, -18, 68, -6);
        swGrad.addColorStop(0, 'rgba(251, 191, 36, 0)');
        swGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.85)');
        swGrad.addColorStop(1, '#ffffff');
        ctx.strokeStyle = swGrad;
        ctx.lineCap = 'round';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(24, -18, 42, -0.25, 0.45);
        ctx.stroke();
        ctx.restore();
      } else if (f.pose === 'block') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const shGrad = ctx.createRadialGradient(34, -68, 6, 34, -68, 46);
        shGrad.addColorStop(0, 'rgba(56, 189, 248, 0.42)');
        shGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.14)');
        shGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = shGrad;
        ctx.beginPath();
        ctx.arc(34, -68, 46, -Math.PI * 0.55, Math.PI * 0.55);
        ctx.fill();
        ctx.strokeStyle = hasDedicatedBlock ? 'rgba(125, 211, 252, 0.58)' : 'rgba(125, 211, 252, 0.92)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(34, -68, 40, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
        ctx.restore();
      } else if (f.pose === 'dizzy' && !isPortrait) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
          const a = time * 0.008 + (i * Math.PI * 2) / 3;
          const sxPos = Math.cos(a) * 24;
          const syPos = -132 + Math.sin(a) * 7;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(sxPos, syPos - 7);
          ctx.lineTo(sxPos + 2.5, syPos - 2.5);
          ctx.lineTo(sxPos + 7, syPos);
          ctx.lineTo(sxPos + 2.5, syPos + 2.5);
          ctx.lineTo(sxPos, syPos + 7);
          ctx.lineTo(sxPos - 2.5, syPos + 2.5);
          ctx.lineTo(sxPos - 7, syPos);
          ctx.lineTo(sxPos - 2.5, syPos - 2.5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
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
    ctx.fillStyle = p.suitDark;
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
    ctx.fillStyle = p.primary;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-2, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colorOverride || '#18181b';
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

  const armBase = p.bareChest || p.id === 'scorpio' ? p.skin : p.suitDark;
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

  // Ninja shin guard strap lines
  if (p.hairOrHat === 'ninja_hood') {
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
    // Pectoral & 6-pack abs sculpting
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
  } else {
    // Classic V-Vest + Quilted Shoulder Flaps
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
  ctx.fillStyle = p.secondary;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.fillRect(-14, 34, 28, 6);
  ctx.strokeRect(-14, 34, 28, 6);

  if (p.hairOrHat === 'ninja_hood') {
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
  }

  if (p.hairOrHat === 'kamen_helmet') {
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

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(3, -6, 6, 3);
    ctx.shadowBlur = 0;
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

  // === COMBAT SLASH & BLOCK SHIELD FX ===
  if (f.pose === 'uppercut') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = '#fde047';
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(fHandX - 6, fHandY + 24, 34, -Math.PI * 0.72, Math.PI * 0.14);
    ctx.stroke();
    ctx.restore();
  } else if (f.pose === 'punch' || f.pose === 'kick' || f.pose === 'jump_kick') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const tx = f.pose === 'punch' ? fHandX : fFootX;
    const ty = f.pose === 'punch' ? fHandY : fFootY;
    const cGrad = ctx.createLinearGradient(tx - 32, ty, tx + 14, ty);
    cGrad.addColorStop(0, 'rgba(255,255,255,0)');
    cGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(tx - 32, ty - 8);
    ctx.lineTo(tx + 14, ty);
    ctx.lineTo(tx - 32, ty + 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (f.pose === 'block') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(sway + 24, torsoY + 8, 36, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.restore();
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
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(proj.originX, proj.y);
    ctx.lineTo(proj.x, proj.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.translate(proj.x, proj.y);
    ctx.scale(dir, 1);
    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    aura.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
    aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.translate(proj.x, proj.y);
    ctx.scale(dir, 1);
    ctx.globalCompositeOperation = 'lighter';

    // Motion Tail Cone
    const tail = ctx.createLinearGradient(-48, 0, 14, 0);
    tail.addColorStop(0, 'rgba(255,255,255,0)');
    tail.addColorStop(0.65, proj.color);
    tail.addColorStop(1, '#ffffff');
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(-48, -2);
    ctx.quadraticCurveTo(-8, -14, 16, 0);
    ctx.quadraticCurveTo(-8, 14, -48, 2);
    ctx.closePath();
    ctx.fill();

    // Outer Additive Halo
    const halo = ctx.createRadialGradient(2, 0, 2, 2, 0, 26);
    halo.addColorStop(0, '#ffffff');
    halo.addColorStop(0.35, proj.core);
    halo.addColorStop(0.7, proj.color);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(2, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Orbit Ring
    ctx.rotate(time * 0.025);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 6, 0.35, 0, Math.PI * 1.45);
    ctx.stroke();
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

const STORY_VIDEO_DURATION_MS = 6000;

function formatVideoSec(ms: number) {
  const sec = Math.max(0, Math.min(6, Math.floor(ms / 1000)));
  return `00:0${sec}`;
}

function StoryCutsceneVideoPlayer({
  route,
  chapter,
  chapterIdx,
  totalChapters,
  arenaInfo,
  playerProfile,
  oppProfile,
  muted,
  onToggleMute,
  onTriggerCue,
  onBackToSelect,
  onStartFight,
}: {
  route: StoryRoute;
  chapter: StoryChapter;
  chapterIdx: number;
  totalChapters: number;
  arenaInfo: (typeof ARENAS)[number];
  playerProfile: FighterProfile;
  oppProfile: FighterProfile;
  muted: boolean;
  onToggleMute: () => void;
  onTriggerCue: (cue: 'select' | 'fireball' | 'gong' | 'heavy') => void;
  onBackToSelect: () => void;
  onStartFight: () => void;
}) {
  const [playKey, setPlayKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const elapsedMsRef = useRef(0);
  const isPlayingRef = useRef(true);
  const triggerCueRef = useRef(onTriggerCue);
  triggerCueRef.current = onTriggerCue;
  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cueFiredRef = useRef<{ intro: boolean; reveal: boolean; clash: boolean }>({
    intro: false,
    reveal: false,
    clash: false,
  });

  const isHero = route === 'hero';
  const progress = Math.min(1, elapsedMs / STORY_VIDEO_DURATION_MS);
  const isFinished = elapsedMs >= STORY_VIDEO_DURATION_MS;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Reset timeline cleanly whenever chapter changes
  useEffect(() => {
    elapsedMsRef.current = 0;
    setElapsedMs(0);
    isPlayingRef.current = true;
    setIsPlaying(true);
    setPlayKey((k) => k + 1);
    cueFiredRef.current = { intro: false, reveal: false, clash: false };
    preloadRawImage(chapter.cutsceneUrl, true);
  }, [chapter.fighter, chapter.cutsceneUrl, chapterIdx]);

  const handleReplay = useCallback(() => {
    cueFiredRef.current = { intro: false, reveal: false, clash: false };
    elapsedMsRef.current = 0;
    setElapsedMs(0);
    isPlayingRef.current = true;
    setIsPlaying(true);
    setPlayKey((k) => k + 1);
  }, []);

  // Keyboard shortcut [R] for Replay while on story cutscene
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReplay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleReplay]);

  // Synchronized audio cues with cutscene beats
  useEffect(() => {
    if (!isPlaying || muted) return;
    if (elapsedMs >= 100 && !cueFiredRef.current.intro) {
      cueFiredRef.current.intro = true;
      triggerCueRef.current('select');
    }
    if (elapsedMs >= 1200 && !cueFiredRef.current.reveal) {
      cueFiredRef.current.reveal = true;
      triggerCueRef.current('fireball');
    }
    if (elapsedMs >= 3600 && !cueFiredRef.current.clash) {
      cueFiredRef.current.clash = true;
      triggerCueRef.current('gong');
    }
  }, [elapsedMs, isPlaying, muted]);

  // 60FPS playback clock + animated real-time particle/shockwave/lightning video FX canvas
  useEffect(() => {
    const canvas = fxCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const particles = Array.from({ length: 44 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 41) % 100) / 100,
      vx: ((i % 7) - 3) * 0.00055,
      vy: -(0.0013 + (i % 5) * 0.0005),
      size: 1.5 + (i % 4) * 1.1,
      alpha: 0.42 + (i % 5) * 0.12,
    }));

    let lastTs = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min(50, now - lastTs);
      lastTs = now;

      if (isPlayingRef.current && elapsedMsRef.current < STORY_VIDEO_DURATION_MS) {
        const nextMs = Math.min(STORY_VIDEO_DURATION_MS, elapsedMsRef.current + dt);
        elapsedMsRef.current = nextMs;
        setElapsedMs(nextMs);
      }

      if (canvas && ctx) {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Subtle animated scanlines & film frame aura
        ctx.fillStyle = 'rgba(2, 6, 23, 0.12)';
        for (let y = (Math.floor(now * 0.04) % 8); y < h; y += 8) {
          ctx.fillRect(0, y, w, 1);
        }

        // Dynamic particles drifting across the video scene
        particles.forEach((pt, idx) => {
          if (isPlayingRef.current) {
            pt.x = (pt.x + pt.vx * (dt / 16) + 1) % 1;
            pt.y = (pt.y + pt.vy * (dt / 16) + 1) % 1;
          }
          const px = pt.x * w;
          const py = pt.y * h;
          const flick = 0.65 + 0.35 * Math.sin(now * 0.008 + idx);
          ctx.save();
          ctx.globalAlpha = pt.alpha * flick;
          ctx.fillStyle = idx % 3 === 0 ? '#ffffff' : chapter.cutsceneAccent;
          ctx.shadowColor = chapter.cutsceneAccent;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Dramatic radial shockwaves during Opponent Reveal (1.1s-2.4s) & Climax Clash (3.5s-4.8s)
        const curSec = elapsedMsRef.current / 1000;
        const wave1 = curSec >= 1.1 && curSec <= 2.4 ? (curSec - 1.1) / 1.3 : -1;
        const wave2 = curSec >= 3.5 && curSec <= 4.9 ? (curSec - 3.5) / 1.4 : -1;
        [wave1, wave2].forEach((wp) => {
          if (wp < 0) return;
          const radius = 40 + wp * w * 0.62;
          ctx.save();
          ctx.strokeStyle = chapter.cutsceneAccent;
          ctx.globalAlpha = (1 - wp) * 0.72;
          ctx.lineWidth = 4 * (1 - wp) + 1;
          ctx.shadowColor = chapter.cutsceneAccent;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.45, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });

        // Speed lines around perimeter when action surges
        if (isPlayingRef.current && curSec < 5.6) {
          ctx.save();
          ctx.strokeStyle = chapter.cutsceneAccent;
          ctx.globalAlpha = 0.22;
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 14; i++) {
            const ang = (i / 14) * Math.PI * 2 + now * 0.0005;
            const rIn = w * (0.36 + ((i + Math.floor(now / 60)) % 3) * 0.04);
            const rOut = w * 0.58;
            ctx.beginPath();
            ctx.moveTo(w * 0.5 + Math.cos(ang) * rIn, h * 0.46 + Math.sin(ang) * rIn * 0.6);
            ctx.lineTo(w * 0.5 + Math.cos(ang) * rOut, h * 0.46 + Math.sin(ang) * rOut * 0.6);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [chapter.cutsceneAccent, playKey]);

  // Progressive typewriter movie subtitle synced to video timeline
  const visibleSubtitleChars = Math.floor(
    Math.min(1, progress / 0.8) * chapter.storyText.length
  );
  const typedStoryText = chapter.storyText.slice(0, visibleSubtitleChars);

  const showOpponentBadge = elapsedMs >= 950;
  const showVsStrip = elapsedMs >= 2800;

  return (
    <div className="max-w-5xl w-full bg-slate-950/95 border-2 border-amber-500/45 rounded-3xl overflow-hidden shadow-2xl">
      {/* 16:9 Cinema Video Viewport */}
      <div className="relative aspect-video w-full bg-black overflow-hidden select-none">
        {/* Blurred Arena Backdrop fallback */}
        <img
          src={arenaInfo.url}
          alt={arenaInfo.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm scale-105"
        />

        {/* Animated Opponent Video Scene */}
        <img
          key={`${chapter.fighter}-${playKey}`}
          src={chapter.cutsceneUrl}
          alt={oppProfile.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-story-camera"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        />

        {/* Dynamic Impact Flash & Diagonal Energy Sweep */}
        <div
          key={`flash-${chapter.fighter}-${playKey}`}
          className="absolute inset-0 animate-story-flash pointer-events-none"
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
            background: `radial-gradient(circle, #ffffff 0%, ${chapter.cutsceneAccent}88 45%, transparent 78%)`,
          }}
        />
        <div
          key={`sweep-${chapter.fighter}-${playKey}`}
          className="absolute inset-y-0 w-1/3 animate-story-sweep pointer-events-none"
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
            background: `linear-gradient(90deg, transparent, ${chapter.cutsceneAccent}bb, #ffffff, ${chapter.cutsceneAccent}bb, transparent)`,
          }}
        />

        {/* 60FPS Particle / Shockwave / Speed-Line FX Canvas */}
        <canvas
          ref={fxCanvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Vignette & Accent Rim Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 95px rgba(2,6,23,0.92), inset 0 0 42px ${chapter.cutsceneAccent}55`,
          }}
        />

        {/* Top Cinema Letterbox + Chapter HUD */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/95 via-black/75 to-transparent px-4 py-3 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase border',
                isHero
                  ? 'bg-sky-500/25 text-sky-200 border-sky-400/60'
                  : 'bg-rose-500/25 text-rose-200 border-rose-400/60'
              )}
            >
              <Film size={13} /> {isHero ? 'HERO ROUTE' : 'MONSTER ROUTE'} · CH {chapterIdx + 1}/{totalChapters}
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200">
              {chapter.chapterTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-black/80 border border-slate-700 text-slate-200">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  isFinished ? 'bg-emerald-400' : isPlaying ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                )}
              />
              {isFinished ? 'SIAP BERTARUNG' : isPlaying ? 'TAYANGAN STORY' : 'JEDA'} · {formatVideoSec(elapsedMs)} / 00:06
            </span>
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 border border-slate-700 text-slate-200"
              title={muted ? 'Nyalakan Audio' : 'Bisukan Audio'}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Dynamic Challenger Reveal Card + VS Matchup Strip */}
        <div className="absolute inset-x-0 bottom-[21%] sm:bottom-[19%] px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 z-10 pointer-events-none">
          {showOpponentBadge && (
            <div className="animate-story-hud-in bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 max-w-md shadow-2xl">
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                <FighterPortrait id={oppProfile.id} active={true} variant="bust" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                    LAWAN BERIKUTNYA
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                    {arenaInfo.name}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white leading-tight truncate">
                  {oppProfile.name}
                </h3>
                <p className="text-[11px] font-bold text-cyan-300 truncate">
                  {oppProfile.codename} · Jurus: {oppProfile.specialName}
                </p>
                <p className="text-[11px] italic text-amber-200 mt-0.5 line-clamp-1">
                  {chapter.challengerLine}
                </p>
              </div>
            </div>
          )}

          {showVsStrip && (
            <div className="animate-story-hud-in hidden sm:flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3.5 py-2 shadow-xl">
              <div className="text-right">
                <div className="text-xs font-black text-emerald-300">{playerProfile.name}</div>
                <div className="text-[10px] font-bold text-slate-400">PEMAIN</div>
              </div>
              <span className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-red-600">
                VS
              </span>
              <div className="text-left">
                <div className="text-xs font-black text-rose-400">{oppProfile.name}</div>
                <div className="text-[10px] font-bold text-slate-400">CHALLENGER</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Cinema Letterbox with Synchronized Typewriter Story Subtitle */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent px-4 sm:px-8 pt-6 pb-3 text-center z-10">
          <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-100 leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] max-w-3xl mx-auto min-h-[2.4rem]">
            {typedStoryText}
            {!isFinished && isPlaying && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-amber-400 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Paused Overlay Indicator */}
        {!isPlaying && !isFinished && (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/75 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-2xl z-20 hover:scale-105 transition-transform"
            title="Lanjutkan Animasi"
          >
            <Play size={28} />
          </button>
        )}
      </div>

      {/* Video Progress Scrubber & Action Controls */}
      <div className="p-4 sm:p-5 bg-slate-900/95 border-t border-slate-800 space-y-3.5">
        {/* Interactive Timeline Bar */}
        <div
          role="slider"
          aria-label="Timeline Video Story"
          aria-valuemin={0}
          aria-valuemax={STORY_VIDEO_DURATION_MS}
          aria-valuenow={Math.round(elapsedMs)}
          tabIndex={0}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const nextMs = ratio * STORY_VIDEO_DURATION_MS;
            elapsedMsRef.current = nextMs;
            setElapsedMs(nextMs);
          }}
          className="relative h-2.5 w-full rounded-full bg-slate-800 cursor-pointer overflow-hidden border border-slate-700"
        >
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${chapter.cutsceneAccent}, #f59e0b)`,
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                if (isFinished) handleReplay();
                else setIsPlaying((p) => !p);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-100 inline-flex items-center gap-1.5"
            >
              {isPlaying && !isFinished ? <Pause size={14} /> : <Play size={14} />}
              {isFinished ? 'Putar Lagi' : isPlaying ? 'Jeda' : 'Lanjut'}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-amber-300 inline-flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Putar Ulang [R]
            </button>
            <button
              type="button"
              onClick={onBackToSelect}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Pilih Karakter [ESC]
            </button>
          </div>

          <button
            type="button"
            onClick={onStartFight}
            className={cn(
              'w-full sm:w-auto px-7 py-3 rounded-2xl font-black text-sm sm:text-base text-white shadow-xl active:scale-95 transition-all inline-flex items-center justify-center gap-2',
              isHero
                ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-amber-500 hover:from-sky-500 hover:to-amber-400'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400',
              isFinished && 'ring-2 ring-amber-300 animate-pulse'
            )}
          >
            <Swords size={19} /> {isFinished ? 'MULAI PERTARUNGAN! [ENTER]' : 'LEWATI & TARUNG! [ENTER]'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FightingGame({ currentStudent, isAdmin, onExit, onFirestoreError }: FightingGameProps) {
  const [screen, setScreen] = useState<'title' | 'select' | 'story' | 'arena' | 'victory' | 'gameover'>('title');
  const [playMode, setPlayMode] = useState<'arcade' | 'online'>('arcade');
  const [arcadeSubMode, setArcadeSubMode] = useState<ArcadeSubMode>('solo');
  const [storyRoute, setStoryRoute] = useState<StoryRoute>('hero');
  const [selectedChar, setSelectedChar] = useState<FighterId>('scorpio');
  const [selectedStage, setSelectedStage] = useState<StageId>(1);
  const [arcadeStageIdx, setArcadeStageIdx] = useState(0);

  const [soloVariant, setSoloVariant] = useState<SoloVariant>('challenge');
  const [freeDifficulty, setFreeDifficulty] = useState<FreeDifficulty>('normal');
  const [freeOpponent, setFreeOpponent] = useState<FighterId | 'random'>('random');
  const [trainingDummyChar, setTrainingDummyChar] = useState<FighterId>('virus_rex');
  const [trainingDummyBehavior, setTrainingDummyBehavior] = useState<TrainingDummyBehavior>('diam');
  const [trainingAutoRegen, setTrainingAutoRegen] = useState<boolean>(true);
  const [trainingDummyCount, setTrainingDummyCount] = useState<number>(1);

  const soloVariantRef = useRef<SoloVariant>('challenge');
  const freeDifficultyRef = useRef<FreeDifficulty>('normal');
  const freeOpponentRef = useRef<FighterId | 'random'>('random');
  const trainingDummyCharRef = useRef<FighterId>('virus_rex');
  const trainingDummyBehaviorRef = useRef<TrainingDummyBehavior>('diam');
  const trainingAutoRegenRef = useRef<boolean>(true);

  useEffect(() => { soloVariantRef.current = soloVariant; }, [soloVariant]);
  useEffect(() => { freeDifficultyRef.current = freeDifficulty; }, [freeDifficulty]);
  useEffect(() => { freeOpponentRef.current = freeOpponent; }, [freeOpponent]);
  useEffect(() => { trainingDummyCharRef.current = trainingDummyChar; }, [trainingDummyChar]);
  useEffect(() => { trainingDummyBehaviorRef.current = trainingDummyBehavior; }, [trainingDummyBehavior]);
  useEffect(() => { trainingAutoRegenRef.current = trainingAutoRegen; }, [trainingAutoRegen]);

  const [muted, setMuted] = useState(false);
  const [bannerReady, setBannerReady] = useState(() => FATALITY_IMAGE_CACHE.has(menuBannerUrl));
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
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
  const arcadeSubModeRef = useRef<ArcadeSubMode>('solo');
  const storyRouteRef = useRef<StoryRoute>('hero');
  const selectedStageRef = useRef<StageId>(1);

  const availableRoster: FighterId[] =
    playMode === 'online' || arcadeSubMode === 'solo'
      ? PLAYABLE_IDS
      : arcadeSubMode === 'hero_story'
      ? HERO_IDS
      : MONSTER_IDS;

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
    arcadeSubModeRef.current = arcadeSubMode;
  }, [arcadeSubMode]);

  useEffect(() => {
    storyRouteRef.current = storyRoute;
  }, [storyRoute]);

  const selectArcadeMode = useCallback((mode: ArcadeSubMode) => {
    setPlayMode('arcade');
    playModeRef.current = 'arcade';
    setArcadeSubMode(mode);
    arcadeSubModeRef.current = mode;

    if (mode === 'hero_story') {
      setStoryRoute('hero');
      storyRouteRef.current = 'hero';
      setSelectedChar((prev) => (HERO_IDS.includes(prev) ? prev : HERO_IDS[0]));
    } else if (mode === 'monster_story') {
      setStoryRoute('monster');
      storyRouteRef.current = 'monster';
      setSelectedChar((prev) => (MONSTER_IDS.includes(prev) ? prev : MONSTER_IDS[0]));
    }
  }, []);

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

  // Immediately preload ALL AI images (banner, 9 arenas, all 13 character sprites, 39 fatality artworks) on mount
  useEffect(() => {
    const unsubProgress = subscribeSpriteLoadProgress((info) => {
      setSpriteProgress(info);
    });

    ensureAllGameAssetsLoaded();

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
    fatalityVisual: {
      fighterId: FighterId;
      attackerName: string;
      fatalityName: string;
      imageUrl: string;
      accent: string;
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
    fatalityVisual: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<MkAudioSynth | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const scoreRef = useRef(0);
  const isSavingRef = useRef(false);

  const setPausedSafe = useCallback((paused: boolean) => {
    isPausedRef.current = paused;
    setIsPaused(paused);
    if (paused) {
      keysRef.current = {};
      synthRef.current?.stopBgm();
    }
  }, []);

  // Multiplayer realtime sync refs
  const localAttackNonceRef = useRef(0);
  const pendingLocalAttackRef = useRef<CombatActionName | undefined>(undefined);
  const lastRemoteP2AttackNonceRef = useRef(0);
  const lastAppliedP1AttackNonceRef = useRef(0);
  const lastAppliedP2SeqRef = useRef(-1);
  const p2SeqCounterRef = useRef(1);
  const p2HitSeqCounterRef = useRef(0);
  const lastAppliedP2HitSeqRef = useRef(0);
  const lastAppliedHostSeqRef = useRef(-1);
  const lastAppliedBannerIdRef = useRef(0);
  const bannerIdCounterRef = useRef(1);
  const hostSeqCounterRef = useRef(1);
  const projIdCounterRef = useRef(1);
  const lastNetworkSendMsRef = useRef(0);
  const lastSentSnapHashRef = useRef('');
  const isSyncWritingRef = useRef(false);
  const syncWriteStartMsRef = useRef(0);

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
    if (!next && screen === 'arena' && !isPausedRef.current) synthRef.current?.startBgm();
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
    extraDummies: FighterRuntime[];
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
      imageUrl: string;
      accent: string;
      attackerX: number;
      targetX: number;
      targetY: number;
    } | null;
    pWins: number;
    eWins: number;
    round: number;
    stageIdx: number;
    totalStages: number;
    diffLevel: number;
    stageId: StageId;
    aiCooldown: number;
    mode: 'arcade' | 'online';
    soloVariant: SoloVariant;
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
    jumpPending: false,
    wasAirborne: false,
    isLocalPlayer,
    remoteTargetX: x,
    remoteTargetY: GROUND_Y,
    remoteTargetVx: 0,
    remoteTargetVy: 0,
    remoteTargetPose: 'idle',
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
      const isOnline = options?.mode === 'online';
      const isSoloTower = !isOnline && arcadeSubModeRef.current === 'solo';
      const activeSoloVar: SoloVariant = isSoloTower ? (soloVariantRef.current || 'challenge') : 'challenge';
      const campaign = STORY_CAMPAIGNS[storyRouteRef.current];

      let totalStages = 1;
      let diffLevel = 0.5;
      let chosenStageId: StageId = options?.stageId ?? selectedStageRef.current;
      let opponentId: FighterId = options?.p2FighterId || 'virus_rex';
      let hpMult = 1;
      let powerMult = 1;
      let speedMult = 1;

      const soloCfg = SOLO_STAGES[stageIndex] || SOLO_STAGES[0];
      const storyCfg = campaign.stages[stageIndex] || campaign.stages[0];

      if (isOnline) {
        totalStages = 1;
        opponentId = options?.p2FighterId || 'scorpio';
      } else if (isSoloTower) {
        if (activeSoloVar === 'challenge') {
          totalStages = SOLO_STAGES.length;
          diffLevel = stageIndex / Math.max(1, totalStages - 1);
          chosenStageId = soloCfg.stage;
          opponentId = soloCfg.fighter;
          hpMult = soloCfg.hpMult;
          powerMult = soloCfg.powerMult;
          speedMult = soloCfg.speedMult;
        } else if (activeSoloVar === 'free') {
          totalStages = 1;
          const freeCfg = FREE_DIFFICULTY_CFG[freeDifficultyRef.current];
          diffLevel = freeCfg.diffLevel;
          chosenStageId = selectedStageRef.current;
          const rawOpp = freeOpponentRef.current;
          if (rawOpp === 'random') {
            const others = PLAYABLE_IDS.filter((id) => id !== playerId);
            opponentId = others[Math.floor(Math.random() * others.length)] || 'virus_rex';
          } else {
            opponentId = rawOpp;
          }
          hpMult = freeCfg.hpMult;
          powerMult = freeCfg.powerMult;
          speedMult = freeCfg.speedMult;
        } else {
          // training
          totalStages = 1;
          diffLevel = 0.25;
          chosenStageId = selectedStageRef.current;
          opponentId = trainingDummyCharRef.current;
          hpMult = 99.0;
          powerMult = 0.4;
          speedMult = 0.8;
        }
      } else {
        totalStages = campaign.stages.length;
        diffLevel = stageIndex / Math.max(1, totalStages - 1);
        chosenStageId = stageIndex === 0 ? selectedStageRef.current : storyCfg.stage;
        opponentId = storyCfg.fighter;
        hpMult = 0.94 + diffLevel * 0.42;
        powerMult = 0.92 + diffLevel * 0.34;
        speedMult = 0.96 + diffLevel * 0.22;
      }

      // Prevent mirror match on challenge mode
      if (!isOnline && isSoloTower && activeSoloVar === 'challenge' && opponentId === playerId) {
        if (stageIndex === SOLO_STAGES.length - 1) {
          opponentId = playerId === 'virus_rex' ? 'ultraman_zero' : 'virus_rex';
        } else {
          const altIdx = (PLAYABLE_IDS.indexOf(opponentId) + 2) % PLAYABLE_IDS.length;
          opponentId = PLAYABLE_IDS[altIdx];
        }
      }

      const side = options?.mySide || 'p1';
      const arenaInfo = ARENAS.find((a) => a.id === chosenStageId) || ARENAS[0];
      const pProf = FIGHTERS[playerId];
      const baseOppProf = FIGHTERS[opponentId];

      const eProf: FighterProfile = isOnline
        ? baseOppProf
        : {
            ...baseOppProf,
            maxHp: Math.round(baseOppProf.maxHp * hpMult),
            power: Number((baseOppProf.power * powerMult).toFixed(2)),
            speed: Number((baseOppProf.speed * speedMult).toFixed(2)),
          };

      prioritizeArenaBackground(chosenStageId);
      prioritizeFighterSprites(pProf.id);
      prioritizeFighterSprites(eProf.id);
      prewarmFatalityImages(pProf.id);
      prewarmFatalityImages(eProf.id);

      keysRef.current = {};
      pendingLocalAttackRef.current = undefined;
      setPausedSafe(false);

      setHudState((prev) => ({
        ...prev,
        fatalityActive: false,
        fatalityVisual: null,
        finishHim: false,
      }));

      const stageBannerSub = isOnline
        ? `${options?.p1Label} VS ${options?.p2Label}`
        : isSoloTower
        ? activeSoloVar === 'training'
          ? `TRAINING MODE · ${arenaInfo.name}`
          : activeSoloVar === 'free'
          ? `FREE MODE (${FREE_DIFFICULTY_CFG[freeDifficultyRef.current].label}) · ${arenaInfo.name}`
          : `STAGE ${stageIndex + 1}/${totalStages} (${soloCfg.tierLabel}) · ${arenaInfo.name}`
        : `${storyCfg.chapterTitle} · ${arenaInfo.name}`;

      const extraDummiesList: FighterRuntime[] = [];
      if (activeSoloVar === 'training' && !isOnline) {
        setTrainingDummyCount(1);
      }

      engineRef.current = {
        player: makeFighterRuntime(pProf, 200, 1, !isOnline || side === 'p1'),
        enemy: makeFighterRuntime(eProf, 600, -1, isOnline && side === 'p2'),
        extraDummies: extraDummiesList,
        projectiles: [],
        particles: [],
        banners: [
          {
            text: activeSoloVar === 'training' ? 'TRAINING ARENA' : `ROUND ${roundN}`,
            subtext: stageBannerSub,
            color: '#fbbf24',
            x: STAGE_W / 2,
            y: 195,
            life: 110,
            scale: 1.2,
          },
        ],
        timer: activeSoloVar === 'training' ? 99 : 99,
        timerAcc: 0,
        phase: activeSoloVar === 'training' ? 'fight' : 'intro',
        phaseTimer: activeSoloVar === 'training' ? 10 : 115,
        shake: 0,
        hitStop: 0,
        fatalityDark: 0,
        fatalityCine: null,
        pWins: pW,
        eWins: eW,
        round: roundN,
        stageIdx: stageIndex,
        totalStages,
        diffLevel,
        stageId: chosenStageId,
        aiCooldown: Math.round(28 - diffLevel * 12),
        mode: isOnline ? 'online' : 'arcade',
        soloVariant: activeSoloVar,
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
    [setPausedSafe]
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
          await updateDoc(ref, {
            status: 'abandoned',
            updatedAt: serverTimestamp(),
          }).catch(() => {});
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
    (charId: FighterId, subModeOverride?: ArcadeSubMode) => {
      cleanupMatchSubscription();
      const mode = subModeOverride || arcadeSubModeRef.current;
      setArcadeSubMode(mode);
      arcadeSubModeRef.current = mode;

      // Enforce faction lock for Hero Route & Monster Route
      let chosenChar = charId;
      if (mode === 'hero_story') {
        setStoryRoute('hero');
        storyRouteRef.current = 'hero';
        if (!HERO_IDS.includes(chosenChar)) chosenChar = HERO_IDS[0];
      } else if (mode === 'monster_story') {
        setStoryRoute('monster');
        storyRouteRef.current = 'monster';
        if (!MONSTER_IDS.includes(chosenChar)) chosenChar = MONSTER_IDS[0];
      }

      setPlayMode('arcade');
      playModeRef.current = 'arcade';
      setSelectedChar(chosenChar);
      scoreRef.current = 0;
      setScore(0);
      setOnlineOutcomeMsg(null);
      setArcadeStageIdx(0);

      if (mode === 'solo') {
        initRound(chosenChar, 0, 1, 0, 0);
        setScreen('arena');
        if (!muted) synthRef.current?.startBgm();
      } else {
        synthRef.current?.stopBgm();
        synthRef.current?.playSfx('select');
        const activeRoute: StoryRoute = mode === 'monster_story' ? 'monster' : 'hero';
        STORY_CAMPAIGNS[activeRoute].stages.forEach((ch) => {
          preloadRawImage(ch.cutsceneUrl, true);
        });
        const firstChapter = STORY_CAMPAIGNS[activeRoute].stages[0];
        if (firstChapter) {
          prioritizeFighterSprites(chosenChar);
          prioritizeFighterSprites(firstChapter.fighter);
          prioritizeArenaBackground(selectedStageRef.current);
        }
        setScreen('story');
      }
    },
    [cleanupMatchSubscription, initRound, muted]
  );

  const launchStoryStage = useCallback(
    (stageIdxOverride?: number) => {
      const idx = stageIdxOverride ?? arcadeStageIdx;
      initRound(selectedChar, idx, 1, 0, 0);
      setScreen('arena');
      if (!muted) synthRef.current?.startBgm();
    },
    [arcadeStageIdx, initRound, muted, selectedChar]
  );

  const togglePause = useCallback(() => {
    if (screen !== 'arena') return;
    const next = !isPausedRef.current;
    setPausedSafe(next);
    if (!next && !muted) {
      synthRef.current?.startBgm();
    }
  }, [muted, screen, setPausedSafe]);

  const restartArenaMatch = useCallback(() => {
    if (playModeRef.current !== 'arcade') return;
    const st = engineRef.current;
    const stageIndex = st ? st.stageIdx : arcadeStageIdx;
    const p2Id = st?.enemy.profile.id;
    initRound(selectedChar, stageIndex, 1, 0, 0, p2Id ? { mode: 'arcade', mySide: 'p1', p2FighterId: p2Id, p1Label: '', p2Label: '' } : undefined);
    if (!muted) synthRef.current?.startBgm();
  }, [arcadeStageIdx, initRound, muted, selectedChar]);

  const changeCharacterSolo = useCallback(() => {
    setPausedSafe(false);
    synthRef.current?.stopBgm();
    setScreen('select');
  }, [setPausedSafe]);

  const addTrainingDummy = useCallback(() => {
    const st = engineRef.current;
    if (!st || st.extraDummies.length >= 2) return;
    const dummyProf = FIGHTERS[trainingDummyCharRef.current];
    prioritizeFighterSprites(dummyProf.id);
    const newDummy = makeFighterRuntime(dummyProf, 550 + st.extraDummies.length * 110, -1, false);
    st.extraDummies.push(newDummy);
    setTrainingDummyCount(st.extraDummies.length + 1);
  }, []);

  const removeTrainingDummy = useCallback(() => {
    const st = engineRef.current;
    if (!st || st.extraDummies.length === 0) return;
    st.extraDummies.pop();
    setTrainingDummyCount(st.extraDummies.length + 1);
  }, []);

  const cycleTrainingDummyChar = useCallback(() => {
    const cur = trainingDummyCharRef.current;
    const idx = PLAYABLE_IDS.indexOf(cur);
    const next = PLAYABLE_IDS[(idx + 1) % PLAYABLE_IDS.length];
    setTrainingDummyChar(next);
    trainingDummyCharRef.current = next;
    prioritizeFighterSprites(next);
    const st = engineRef.current;
    if (st) {
      st.enemy.profile = FIGHTERS[next];
      st.enemy.hp = st.enemy.profile.maxHp;
      st.enemy.trailHp = st.enemy.profile.maxHp;
      st.extraDummies.forEach((d) => {
        d.profile = FIGHTERS[next];
        d.hp = d.profile.maxHp;
        d.trailHp = d.profile.maxHp;
      });
    }
  }, []);

  const resetTrainingArena = useCallback(() => {
    initRound(selectedChar, 0, 1, 0, 0);
  }, [initRound, selectedChar]);

  const returnToMainMenu = useCallback(() => {
    setPausedSafe(false);
    synthRef.current?.stopBgm();
    leaveOnlineMatch(true);
    setMatchStatus('idle');
    setScreen('title');
  }, [leaveOnlineMatch, setPausedSafe]);

  const launchOnlineBattle = useCallback(
    (m: OnlineMatchDoc, side: 'p1' | 'p2') => {
      if (!m.p2Fighter || !m.p2Name) return;
      scoreRef.current = 0;
      setScore(0);
      setOnlineOutcomeMsg(null);
      setArcadeStageIdx(0);
      lastRemoteP2AttackNonceRef.current = 0;
      lastAppliedP1AttackNonceRef.current = 0;
      lastAppliedP2SeqRef.current = -1;
      p2SeqCounterRef.current = 1;
      p2HitSeqCounterRef.current = 0;
      lastAppliedP2HitSeqRef.current = 0;
      lastAppliedHostSeqRef.current = -1;
      lastAppliedBannerIdRef.current = 0;
      localAttackNonceRef.current = 0;
      pendingLocalAttackRef.current = undefined;
      lastSentSnapHashRef.current = '';
      isSyncWritingRef.current = false;
      syncWriteStartMsRef.current = 0;

      initRound(m.p1Fighter, 0, 1, 0, 0, {
        mode: 'online',
        mySide: side,
        p2FighterId: m.p2Fighter,
        p1Label: m.p1Name,
        p2Label: m.p2Name,
        stageId: m.stage || 1,
      });
      setScreen('arena');
      if (!muted) synthRef.current?.startBgm();
    },
    [initRound, muted]
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
              const incomingSeq = p2s.seq ?? 0;
              // Ignore local Firestore echoes and out-of-order stale snapshots
              if (incomingSeq > lastAppliedP2SeqRef.current) {
                lastAppliedP2SeqRef.current = incomingSeq;
                const e = st.enemy;
                if (!['hit', 'knockdown', 'ko', 'dizzy'].includes(e.pose)) {
                  e.remoteTargetX = p2s.x;
                  e.remoteTargetY = p2s.y;
                  e.remoteTargetVx = p2s.vx ?? 0;
                  e.remoteTargetVy = p2s.vy ?? 0;
                  if (Math.abs(p2s.x - e.x) > 125) e.x = p2s.x;
                  if (Math.abs(p2s.y - e.y) > 95) e.y = p2s.y;
                }
                e.isBlocking = p2s.isBlocking;
                e.isCrouching = p2s.isCrouching;

                if (['idle', 'walk', 'crouch', 'block', 'jump', 'jump_land'].includes(p2s.pose)) {
                  e.remoteTargetPose = p2s.pose;
                }

                if (p2s.attackNonce > lastRemoteP2AttackNonceRef.current) {
                  lastRemoteP2AttackNonceRef.current = p2s.attackNonce;
                  // Face toward P1 cleanly on strike
                  if (Math.abs(st.player.x - e.x) >= 6) {
                    e.facing = st.player.x >= e.x ? 1 : -1;
                  } else {
                    e.facing = p2s.facing;
                  }
                  const act = p2s.attackAction;
                  if (st.phase === 'finish_him' && (act === 'fatality' || act === 'special' || act === 'uppercut')) {
                    // Remote P2 triggers fatality on P1!
                    const chosen = pickRandomFatalityVariant(e.profile.id);
                    st.phase = 'fatality_cinematic';
                    st.phaseTimer = 180;
                    st.fatalityDark = 0.92;
                    st.shake = 24;
                    st.player.vx = 0;
                    e.vx = 0;
                    st.fatalityCine = {
                      frame: 0,
                      total: 180,
                      attackerSide: 'enemy',
                      fighterId: e.profile.id,
                      variantId: chosen.id,
                      fatalityName: chosen.name,
                      imageUrl: chosen.imageUrl,
                      accent: chosen.accent,
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
                      fatalityVisual: {
                        fighterId: e.profile.id,
                        attackerName: e.profile.name,
                        fatalityName: chosen.name,
                        imageUrl: chosen.imageUrl,
                        accent: chosen.accent,
                        key: Date.now(),
                      },
                    }));
                    synthRef.current?.playSfx('fatality');
                  } else if (act && st.phase === 'fight') {
                    const hasSeq = Boolean(FIGHTER_SPRITE_CONFIG[e.profile.id]?.actionFrames);
                    if (act === 'jump' && e.y >= GROUND_Y - 3 && !e.jumpPending) {
                      e.pose = 'jump';
                      e.poseTimer = 6;
                      e.poseDuration = 6;
                      e.jumpPending = true;
                      e.wasAirborne = false;
                    } else if (act === 'special' && e.energy >= 30) {
                      e.energy -= 30;
                      e.pose = 'special';
                      e.poseTimer = hasSeq ? 28 : 24;
                      e.poseDuration = e.poseTimer;
                      e.hasHitCurrentAttack = true;
                      synthRef.current?.playSfx('fireball');
                      st.projectiles.push({
                        id: projIdCounterRef.current++,
                        owner: 'enemy',
                        originX: e.x + e.facing * 24,
                        x: e.x + e.facing * 44,
                        y: e.y - 72,
                        vx: e.facing * 9.8,
                        type: e.profile.projectileType,
                        color: e.profile.projectileColor,
                        core: e.profile.projectileCore,
                        damage: Math.round(16 * e.profile.power),
                        chill: e.profile.projectileType === 'ice',
                        pull: e.profile.id === 'scorpio',
                        life: 85,
                      });
                    } else if (act === 'fatality' && e.energy >= 100) {
                      e.energy = 0;
                      if (st.player.hp <= 45) {
                        const chosen = pickRandomFatalityVariant(e.profile.id);
                        st.player.hp = 0;
                        st.player.vx = 0;
                        e.vx = 0;
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
                          imageUrl: chosen.imageUrl,
                          accent: chosen.accent,
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
                          fatalityVisual: {
                            fighterId: e.profile.id,
                            attackerName: e.profile.name,
                            fatalityName: chosen.name,
                            imageUrl: chosen.imageUrl,
                            accent: chosen.accent,
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
                          id: projIdCounterRef.current++,
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
                } else if (
                  ['idle', 'walk', 'crouch', 'block'].includes(p2s.pose) &&
                  !['hit', 'knockdown', 'ko', 'dizzy', 'victory'].includes(e.pose) &&
                  e.poseTimer <= 0 &&
                  e.y >= GROUND_Y - 4
                ) {
                  e.pose = p2s.pose;
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

              // Smoothly Reconcile Remote P1 (No bouncy vy bug, no poseTimer rewind flicker!)
              const p1r = st.player;
              const p2r = st.enemy;
              p1r.remoteTargetX = hs.p1.x;
              p1r.remoteTargetY = hs.p1.y;
              p1r.remoteTargetVx = hs.p1.vx ?? 0;
              p1r.remoteTargetVy = hs.p1.vy ?? 0;
              if (Math.abs(hs.p1.x - p1r.x) > 125) p1r.x = hs.p1.x;
              if (Math.abs(hs.p1.y - p1r.y) > 95) p1r.y = hs.p1.y;

              if (Math.abs(p2r.x - p1r.x) >= 6) {
                p1r.facing = p2r.x >= p1r.x ? 1 : -1;
              } else {
                p1r.facing = hs.p1.facing;
              }
              p1r.hp = hs.p1.hp;
              p1r.energy = hs.p1.energy;
              p1r.chillTimer = hs.p1.chillTimer;
              p1r.isBlocking = hs.p1.isBlocking;
              p1r.isCrouching = hs.p1.isCrouching;

              if (['idle', 'walk', 'crouch', 'block', 'jump', 'jump_land'].includes(hs.p1.pose)) {
                p1r.remoteTargetPose = hs.p1.pose;
              }

              if (hs.p1.attackNonce > lastAppliedP1AttackNonceRef.current) {
                lastAppliedP1AttackNonceRef.current = hs.p1.attackNonce;
                const act = hs.p1.attackAction;
                if (act === 'jump' && p1r.y >= GROUND_Y - 3) {
                  p1r.pose = 'jump';
                  p1r.poseTimer = 6;
                  p1r.poseDuration = 6;
                } else if (act && ['punch', 'kick', 'uppercut', 'sweep', 'special', 'fatality'].includes(act)) {
                  const hasSeq = Boolean(FIGHTER_SPRITE_CONFIG[p1r.profile.id]?.actionFrames);
                  const mappedPose: PoseState =
                    p1r.y < GROUND_Y - 5 && act !== 'special'
                      ? 'jump_kick'
                      : act === 'fatality'
                      ? 'uppercut'
                      : (act as PoseState);
                  p1r.pose = mappedPose;
                  p1r.poseDuration =
                    hs.p1.poseDuration > 0
                      ? hs.p1.poseDuration
                      : mappedPose === 'special'
                      ? hasSeq ? 28 : 24
                      : mappedPose === 'uppercut'
                      ? hasSeq ? 26 : 24
                      : mappedPose === 'sweep'
                      ? hasSeq ? 24 : 22
                      : mappedPose === 'kick' || mappedPose === 'jump_kick'
                      ? hasSeq ? 24 : 20
                      : hasSeq ? 20 : 14;
                  p1r.poseTimer = p1r.poseDuration;
                  synthRef.current?.playSfx(
                    mappedPose === 'special' ? 'fireball' : mappedPose === 'uppercut' ? 'heavy' : mappedPose === 'punch' ? 'punch' : 'kick'
                  );
                }
              } else if (['hit', 'knockdown', 'ko', 'dizzy', 'victory'].includes(hs.p1.pose)) {
                if (p1r.pose !== hs.p1.pose) {
                  p1r.pose = hs.p1.pose;
                  p1r.poseTimer = Math.max(8, hs.p1.poseTimer || 18);
                  p1r.poseDuration = Math.max(p1r.poseTimer, hs.p1.poseDuration || 18);
                }
              } else if (
                ['idle', 'walk', 'crouch', 'block'].includes(hs.p1.pose) &&
                !['hit', 'knockdown', 'ko', 'dizzy', 'victory'].includes(p1r.pose) &&
                p1r.poseTimer <= 0 &&
                p1r.y >= GROUND_Y - 4
              ) {
                p1r.pose = hs.p1.pose;
              }

              // Reconcile P2 authoritative HP/Energy/Hit states cleanly once per hit event
              if (hs.p2Hp < p2r.hp) {
                synthRef.current?.playSfx('punch');
                st.shake = 6;
              }
              p2r.hp = hs.p2Hp;
              p2r.energy = hs.p2Energy;
              p2r.chillTimer = hs.p2ChillTimer;
              const incomingHitSeq = hs.p2HitSeq ?? 0;
              if (
                hs.p2PoseOverride &&
                ['hit', 'knockdown', 'ko', 'dizzy', 'victory'].includes(hs.p2PoseOverride) &&
                (incomingHitSeq > lastAppliedP2HitSeqRef.current ||
                  (['ko', 'dizzy', 'victory'].includes(hs.p2PoseOverride) && p2r.pose !== hs.p2PoseOverride))
              ) {
                lastAppliedP2HitSeqRef.current = Math.max(lastAppliedP2HitSeqRef.current, incomingHitSeq);
                p2r.pose = hs.p2PoseOverride;
                if (hs.p2PoseTimer !== undefined) {
                  p2r.poseTimer = hs.p2PoseTimer;
                  p2r.poseDuration = Math.max(hs.p2PoseTimer, 18);
                }
                if (hs.p2PoseOverride === 'knockdown') {
                  p2r.vy = -10;
                }
              }

              st.timer = hs.timer;
              if (hs.phase === 'fatality_cinematic' && st.phase !== 'fatality_cinematic') {
                const attackerSide = hs.fatalityAttacker || 'player';
                const att = attackerSide === 'player' ? st.player : st.enemy;
                const def = attackerSide === 'player' ? st.enemy : st.player;
                const variant = getFatalityVariant(att.profile.id, hs.fatalityVariantId);
                const fatName = hs.fatalityVariantName || variant.name;
                st.fatalityDark = 0.92;
                st.shake = 24;
                att.vx = 0;
                def.vx = 0;
                st.fatalityCine = {
                  frame: 0,
                  total: 180,
                  attackerSide,
                  fighterId: att.profile.id,
                  variantId: variant.id,
                  fatalityName: fatName,
                  imageUrl: variant.imageUrl,
                  accent: variant.accent,
                  attackerX: att.x,
                  targetX: def.x,
                  targetY: def.y,
                };
                setHudState((prev) => ({
                  ...prev,
                  fatalityActive: true,
                  fatalityVisual: {
                    fighterId: att.profile.id,
                    attackerName: att.profile.name,
                    fatalityName: fatName,
                    imageUrl: variant.imageUrl,
                    accent: variant.accent,
                    key: Date.now(),
                  },
                }));
                synthRef.current?.playSfx('fatality');
              } else if (hs.phase !== 'fatality_cinematic' && st.phase === 'fatality_cinematic') {
                setHudState((prev) => ({ ...prev, fatalityActive: false, fatalityVisual: null }));
              }
              st.phase = hs.phase;
              st.phaseTimer = hs.phaseTimer;
              st.pWins = hs.p1Wins;
              st.eWins = hs.p2Wins;
              setPlayerWins(hs.p1Wins);
              setEnemyWins(hs.p2Wins);

              // Smooth projectile reconciliation (never wipe P2's newly launched fireball before host echo!)
              const nowPerf = performance.now();
              const hostProjs = hs.projectiles || [];
              const mergedProjs: Projectile[] = [];
              const usedLocalIdx = new Set<number>();

              hostProjs.forEach((hp) => {
                let matchIdx = -1;
                if (hp.id !== undefined) {
                  matchIdx = st.projectiles.findIndex((lp, idx) => !usedLocalIdx.has(idx) && lp.id === hp.id);
                }
                if (matchIdx < 0) {
                  matchIdx = st.projectiles.findIndex(
                    (lp, idx) =>
                      !usedLocalIdx.has(idx) &&
                      lp.owner === hp.owner &&
                      Math.abs(lp.originX - hp.originX) < 35 &&
                      Math.abs(lp.x - hp.x) < 120
                  );
                }
                if (matchIdx >= 0) {
                  usedLocalIdx.add(matchIdx);
                  const existing = st.projectiles[matchIdx];
                  const nextX = Math.abs(hp.x - existing.x) > 75 ? hp.x : existing.x + (hp.x - existing.x) * 0.45;
                  mergedProjs.push({ ...hp, x: nextX });
                } else {
                  mergedProjs.push({ ...hp });
                }
              });

              st.projectiles.forEach((lp, idx) => {
                if (
                  !usedLocalIdx.has(idx) &&
                  lp.owner === 'enemy' &&
                  lp.createdAtMs !== undefined &&
                  nowPerf - lp.createdAtMs < 450 &&
                  lp.life > 0
                ) {
                  mergedProjs.push(lp);
                }
              });
              st.projectiles = mergedProjs;

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
      keysRef.current = {};
      attacker.vx = 0;
      victim.vx = 0;
      st.fatalityCine = {
        frame: 0,
        total: 180,
        attackerSide,
        fighterId: attacker.profile.id,
        variantId: chosen.id,
        fatalityName: chosen.name,
        imageUrl: chosen.imageUrl,
        accent: chosen.accent,
        attackerX: attacker.x,
        targetX: victim.x,
        targetY: victim.y,
      };
      attacker.pose = 'special';
      attacker.poseTimer = 85;
      attacker.poseDuration = 85;
      victim.pose = 'dizzy';

      setHudState((prev) => ({
        ...prev,
        fatalityActive: true,
        fatalityVisual: {
          fighterId: attacker.profile.id,
          attackerName: attacker.profile.name,
          fatalityName: chosen.name,
          imageUrl: chosen.imageUrl,
          accent: chosen.accent,
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
      const emitOnlineAction = (act: CombatActionName) => {
        if (st.mode === 'online') {
          localAttackNonceRef.current += 1;
          pendingLocalAttackRef.current = act;
        }
      };

      if (st.phase === 'finish_him' && (action === 'fatality' || action === 'special' || action === 'uppercut')) {
        emitOnlineAction(action);
        if (!isP2Local) {
          launchFatalityCinematic(st, 'player');
        } else {
          if (Math.abs(opp.x - p.x) >= 6) p.facing = opp.x >= p.x ? 1 : -1;
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
        if (p.y >= GROUND_Y - 1 && !p.jumpPending && p.pose !== 'jump') {
          if (Math.abs(opp.x - p.x) >= 6) p.facing = opp.x >= p.x ? 1 : -1;
          p.pose = 'jump';
          p.poseTimer = 6;
          p.poseDuration = 6;
          p.jumpPending = true;
          p.wasAirborne = false;
          emitOnlineAction('jump');
        }
        return;
      }

      if (['punch', 'kick', 'uppercut', 'sweep', 'special', 'jump_kick'].includes(p.pose)) return;
      p.jumpPending = false;

      // Always face opponent right before committing to an attack
      if (Math.abs(opp.x - p.x) >= 6) {
        p.facing = opp.x >= p.x ? 1 : -1;
      }

      const hasSeq = Boolean(FIGHTER_SPRITE_CONFIG[p.profile.id]?.actionFrames);

      if (p.y < GROUND_Y - 5) {
        emitOnlineAction(action);
        p.pose = 'jump_kick';
        p.poseTimer = hasSeq ? 24 : 22;
        p.poseDuration = p.poseTimer;
        p.hasHitCurrentAttack = false;
        synthRef.current?.playSfx('kick');
        return;
      }

      if (action === 'special') {
        if (p.energy < 30) return;
        emitOnlineAction('special');
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
          id: projIdCounterRef.current++,
          createdAtMs: performance.now(),
          owner: myRoleSide,
          originX: p.x + p.facing * 24,
          x: p.x + p.facing * 44,
          y: p.y - 72,
          vx: p.facing * 9.8,
          type: p.profile.projectileType,
          color: p.profile.projectileColor,
          core: p.profile.projectileCore,
          damage: Math.round(16 * p.profile.power),
          chill: p.profile.projectileType === 'ice',
          pull: p.profile.id === 'scorpio',
          life: 85,
        });
        return;
      }

      if (action === 'fatality') {
        if (p.energy < 100) return;
        emitOnlineAction('fatality');
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
          id: projIdCounterRef.current++,
          createdAtMs: performance.now(),
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

      emitOnlineAction(action);
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
          const curIdx = availableRoster.indexOf(prev);
          const safeIdx = curIdx >= 0 ? curIdx : 0;
          const next = availableRoster[(safeIdx - 1 + availableRoster.length) % availableRoster.length];
          synthRef.current?.playSfx('select');
          requestAnimationFrame(() => scrollActiveCard(next));
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedChar((prev) => {
          const curIdx = availableRoster.indexOf(prev);
          const safeIdx = curIdx >= 0 ? curIdx : 0;
          const next = availableRoster[(safeIdx + 1) % availableRoster.length];
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
  }, [screen, matchStatus, selectedChar, availableRoster, startArcade, startQuickMatchmaking]);

  // Story Interlude Keyboard Shortcuts: Enter to Fight, Esc to Return
  useEffect(() => {
    if (screen !== 'story') return;
    const onStoryKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        launchStoryStage();
      } else if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setScreen('select');
      }
    };
    window.addEventListener('keydown', onStoryKey, { capture: true });
    return () => window.removeEventListener('keydown', onStoryKey, { capture: true });
  }, [screen, launchStoryStage]);

  // Arena Combat Keyboard Listeners (Capture phase ensures ESC opens Pause/Restart/Menu modal cleanly)
  useEffect(() => {
    if (screen !== 'arena') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === 'Escape' || e.code === 'Escape' || k === 'escape' || k === 'p') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        togglePause();
        return;
      }
      if (isPausedRef.current) return;
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
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      keysRef.current = {};
    };
  }, [screen, togglePause, triggerAction]);

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

      if (st.mode === 'online' && defender === st.enemy) {
        p2HitSeqCounterRef.current += 1;
      }
      if (st.mode === 'online' && !defender.isLocalPlayer) {
        defender.remoteTargetX = defender.x;
        defender.remoteTargetY = defender.y;
        defender.remoteTargetVx = defender.vx;
        defender.remoteTargetVy = defender.vy;
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

      // Atmospheric dark radial backdrop behind exclusive animated AI Fatality artwork
      ctx.save();
      const grad = ctx.createRadialGradient(STAGE_W * 0.5, STAGE_H * 0.5, 40, STAGE_W * 0.5, STAGE_H * 0.5, STAGE_W * 0.65);
      grad.addColorStop(0, 'rgba(69, 10, 10, 0.72)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      ctx.restore();
    };

    const tick = (time: number) => {
      const st = engineRef.current;
      if (!st) return;

      const isOnline = st.mode === 'online';
      const isP2Client = isOnline && st.mySide === 'p2';
      const localFighter = isP2Client ? st.enemy : st.player;

      if (isPausedRef.current && !isOnline) {
        // Freeze physics & timers cleanly while paused; keep canvas crisp
      } else if (st.hitStop > 0) {
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

          const canMoveLocal = ['idle', 'walk', 'jump', 'jump_land', 'crouch', 'block'].includes(localFighter.pose);
          if (canMoveLocal) {
            if (localFighter.isBlocking && localFighter.y >= GROUND_Y - 1 && !localFighter.jumpPending && st.phase === 'fight') {
              localFighter.pose = 'block';
              localFighter.vx = 0;
            } else if (localFighter.isCrouching && !localFighter.jumpPending && st.phase === 'fight') {
              localFighter.pose = 'crouch';
              localFighter.vx = 0;
            } else if (left) {
              localFighter.vx = -localFighter.profile.speed;
              if (
                localFighter.y >= GROUND_Y - 1 &&
                !localFighter.jumpPending &&
                (localFighter.pose !== 'jump_land' || localFighter.poseTimer <= 3)
              ) {
                localFighter.pose = 'walk';
                localFighter.walkPhase += 0.28;
              }
            } else if (right) {
              localFighter.vx = localFighter.profile.speed;
              if (
                localFighter.y >= GROUND_Y - 1 &&
                !localFighter.jumpPending &&
                (localFighter.pose !== 'jump_land' || localFighter.poseTimer <= 3)
              ) {
                localFighter.pose = 'walk';
                localFighter.walkPhase += 0.28;
              }
            } else {
              localFighter.vx *= 0.65;
              if (localFighter.y >= GROUND_Y - 1 && !localFighter.jumpPending && localFighter.pose !== 'jump_land') {
                localFighter.pose = 'idle';
              }
            }
          }
        }

        // Always face each other cleanly on both Left and Right sides (Arcade + Online P1 + Online P2)
        if (st.phase === 'fight' || st.phase === 'finish_him') {
          if (Math.abs(e.x - p.x) >= 6) {
            const autoFacePoses: PoseState[] = ['idle', 'walk', 'crouch', 'block', 'jump', 'jump_land'];
            if (autoFacePoses.includes(p.pose)) p.facing = e.x >= p.x ? 1 : -1;
            if (autoFacePoses.includes(e.pose)) e.facing = p.x >= e.x ? 1 : -1;
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

            // Escalating Arcade Opponent Logic when mode === 'arcade'
            if (!isOnline) {
              const dist = Math.abs(p.x - e.x);
              const dLv = st.diffLevel; // 0.0 (Stage 1) -> 1.0 (Final Boss)
              const aiSpeed = e.chillTimer > 0 ? e.profile.speed * 0.48 : e.profile.speed;
              const canMoveE = ['idle', 'walk', 'jump', 'jump_land', 'crouch', 'block'].includes(e.pose);
              if (e.chillTimer > 0) e.chillTimer--;
              if (st.aiCooldown > 0) st.aiCooldown--;

              if (canMoveE) {
                const blockChance = 0.14 + dLv * 0.5;
                const specialProb = 0.03 + dLv * 0.09;
                const incomingPlayerProj = st.projectiles.some(
                  (pr) => pr.owner === 'player' && Math.abs(pr.x - e.x) < 155 && Math.sign(pr.vx) !== e.facing
                );

                if (e.isBlocking && !e.jumpPending) {
                  e.pose = 'block';
                  e.vx = 0;
                  if (Math.random() < 0.065 - dLv * 0.025) e.isBlocking = false;
                } else if (incomingPlayerProj && Math.random() < 0.12 + dLv * 0.42) {
                  if (dLv >= 0.4 && e.y >= GROUND_Y - 1 && !e.jumpPending && Math.random() < 0.45) {
                    e.vx = e.facing * 4.2;
                    e.pose = 'jump';
                    e.poseTimer = 6;
                    e.poseDuration = 6;
                    e.jumpPending = true;
                    e.wasAirborne = false;
                    st.aiCooldown = Math.round(28 - dLv * 12);
                  } else {
                    e.isBlocking = true;
                    e.pose = 'block';
                  }
                } else if (dist > 110) {
                  e.vx = e.facing * aiSpeed * (0.82 + dLv * 0.24);
                  if (e.y >= GROUND_Y - 1 && !e.jumpPending && e.pose !== 'jump_land') {
                    e.pose = 'walk';
                    e.walkPhase += 0.24;
                  }
                  if (dist > 220 && st.aiCooldown <= 0 && e.energy >= 30 && Math.random() < specialProb) {
                    e.energy -= 30;
                    e.pose = 'special';
                    e.poseTimer = 24;
                    e.poseDuration = 24;
                    e.hasHitCurrentAttack = true;
                    st.aiCooldown = Math.max(18, Math.round(46 - dLv * 24));
                    synthRef.current?.playSfx('fireball');
                    st.projectiles.push({
                      owner: 'enemy',
                      originX: e.x + e.facing * 24,
                      x: e.x + e.facing * 44,
                      y: e.y - 72,
                      vx: e.facing * (8.2 + dLv * 2.4),
                      type: e.profile.projectileType,
                      color: e.profile.projectileColor,
                      core: e.profile.projectileCore,
                      damage: Math.round(13 * e.profile.power),
                      life: 90,
                    });
                  }
                } else {
                  e.vx *= 0.6;
                  if (e.y >= GROUND_Y - 1 && !e.jumpPending && e.pose !== 'jump_land') e.pose = 'idle';

                  // Higher stages guard aggressively or anti-air jumping players
                  if (['punch', 'kick', 'uppercut', 'sweep'].includes(p.pose) && Math.random() < blockChance) {
                    e.isBlocking = true;
                    e.pose = 'block';
                  } else if (p.y < GROUND_Y - 25 && dLv >= 0.45 && st.aiCooldown <= 0 && Math.random() < 0.35 + dLv * 0.35) {
                    e.pose = 'uppercut';
                    e.poseTimer = 24;
                    e.poseDuration = 24;
                    e.hasHitCurrentAttack = false;
                    st.aiCooldown = Math.max(16, Math.round(38 - dLv * 20));
                    synthRef.current?.playSfx('heavy');
                  } else if (st.aiCooldown <= 0) {
                    const roll = Math.random();
                    const cdScale = Math.round(dLv * 18);
                    // Mix in sweep more often at higher difficulty when player blocks
                    const sweepCutoff = p.isBlocking && dLv > 0.35 ? 0.92 : 0.82;
                    if (roll < 0.32) {
                      e.pose = 'punch';
                      e.poseTimer = 15;
                      e.poseDuration = 15;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = Math.max(12, 32 - cdScale);
                      synthRef.current?.playSfx('punch');
                    } else if (roll < 0.62) {
                      e.pose = 'kick';
                      e.poseTimer = 21;
                      e.poseDuration = 21;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = Math.max(14, 36 - cdScale);
                      synthRef.current?.playSfx('kick');
                    } else if (roll < sweepCutoff) {
                      e.pose = 'sweep';
                      e.poseTimer = 22;
                      e.poseDuration = 22;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = Math.max(15, 40 - cdScale);
                      synthRef.current?.playSfx('kick');
                    } else if (roll < 0.92 && e.y >= GROUND_Y - 1 && !e.jumpPending) {
                      e.vx = -e.facing * 3.5;
                      e.pose = 'jump';
                      e.poseTimer = 6;
                      e.poseDuration = 6;
                      e.jumpPending = true;
                      e.wasAirborne = false;
                      st.aiCooldown = Math.max(16, 34 - Math.round(dLv * 14));
                    } else {
                      e.pose = 'uppercut';
                      e.poseTimer = 24;
                      e.poseDuration = 24;
                      e.hasHitCurrentAttack = false;
                      st.aiCooldown = Math.max(18, 42 - cdScale);
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
                if (def.isCrouching && (att.pose === 'punch' || att.pose === 'uppercut' || att.pose === 'special')) {
                  // Crouching successfully evades high punches and uppercuts!
                  return;
                }
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
                p.vx = 0;
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
                if (e.y >= GROUND_Y - 1) e.vx = 0;
                p.pose = 'victory';
                p.vx = 0;
                st.phase = 'round_end';
                st.phaseTimer = 115;
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
                e.vx = 0;
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
                if (p.y >= GROUND_Y - 1) p.vx = 0;
                e.pose = 'victory';
                e.vx = 0;
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
                e.vx = 0;
                p.pose = 'victory';
                p.vx = 0;
                scoreRef.current += 600 + p.hp * 5;
                setScore(scoreRef.current);
              } else {
                p.pose = 'ko';
                p.vx = 0;
                e.pose = 'victory';
                e.vx = 0;
              }
              st.phase = 'round_end';
              st.phaseTimer = 95;
            }
          } else if (st.phase === 'fatality_cinematic') {
            st.phaseTimer--;
            p.vx = 0;
            e.vx = 0;
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
                fatalityVisual: null,
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
                const isSoloTower = arcadeSubModeRef.current === 'solo';
                const totalSt = isSoloTower ? SOLO_STAGES.length : STORY_CAMPAIGNS[storyRouteRef.current].stages.length;
                if (st.pWins >= 2) {
                  const nextStage = st.stageIdx + 1;
                  if (nextStage < totalSt) {
                    setArcadeStageIdx(nextStage);
                    if (isSoloTower) {
                      initRound(selectedChar, nextStage, 1, 0, 0);
                    } else {
                      const nextCh = STORY_CAMPAIGNS[storyRouteRef.current].stages[nextStage];
                      if (nextCh) {
                        prioritizeFighterSprites(nextCh.fighter);
                        preloadRawImage(nextCh.cutsceneUrl, true);
                      }
                      synthRef.current?.stopBgm();
                      setScreen('story');
                      return;
                    }
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
          // Stop any residual slide after winning, falling KO, or round transition
          if (
            ['victory', 'dizzy'].includes(f.pose) ||
            ((f.pose === 'ko' || st.phase === 'round_end' || st.phase === 'fatality_cinematic') && f.y >= GROUND_Y - 1)
          ) {
            f.vx = 0;
          }

          if (isOnline && !f.isLocalPlayer) {
            // Smooth 60FPS Dead-Reckoning + Target Interpolation for Remote Opponent (Eliminates Lag/Flicker!)
            const tVx = f.remoteTargetVx ?? 0;
            let tVy = f.remoteTargetVy ?? 0;
            let tX = (f.remoteTargetX ?? f.x) + tVx;
            let tY = (f.remoteTargetY ?? f.y) + tVy;
            if (tY < GROUND_Y) {
              tVy += GRAVITY;
              if (tY >= GROUND_Y) {
                tY = GROUND_Y;
                tVy = 0;
              }
            } else {
              tY = GROUND_Y;
              tVy = 0;
            }
            tX = Math.max(48, Math.min(STAGE_W - 48, tX));
            f.remoteTargetX = tX;
            f.remoteTargetY = tY;
            f.remoteTargetVy = tVy;

            const dx = tX - f.x;
            const dy = tY - f.y;
            if (Math.abs(dx) > 125) f.x = tX;
            else f.x += dx * 0.36;
            if (Math.abs(dy) > 95) f.y = tY;
            else f.y += dy * 0.42;
            if (f.y >= GROUND_Y - 0.5 && tY >= GROUND_Y - 0.5) {
              f.y = GROUND_Y;
            }
            f.vx = tVx;
            f.vy = tVy;

            // Advance 6-frame walk animation smoothly at full 60FPS!
            if (f.pose === 'walk') {
              f.walkPhase += 0.28;
            }

            if (f.jumpPending) {
              if (f.pose !== 'jump') {
                f.jumpPending = false;
              } else if (f.poseTimer <= 2) {
                f.jumpPending = false;
                f.wasAirborne = true;
                f.poseTimer = 0;
              }
            }

            if (f.poseTimer > 0) {
              f.poseTimer--;
              if (f.poseTimer === 0 && !f.jumpPending && !['ko', 'dizzy', 'victory'].includes(f.pose)) {
                if (f.y < GROUND_Y - 4) {
                  f.pose = 'jump';
                } else {
                  const targetP = f.remoteTargetPose;
                  f.pose = targetP && ['idle', 'walk', 'crouch', 'block'].includes(targetP) ? targetP : 'idle';
                }
              }
            } else if (!['ko', 'dizzy', 'victory', 'hit', 'knockdown'].includes(f.pose)) {
              if (f.y < GROUND_Y - 4) {
                f.pose = 'jump';
                f.wasAirborne = true;
              } else if (f.wasAirborne) {
                f.wasAirborne = false;
                f.pose = 'jump_land';
                f.poseTimer = 7;
                f.poseDuration = 7;
              } else {
                const targetP = f.remoteTargetPose;
                if (targetP && ['idle', 'walk', 'crouch', 'block'].includes(targetP)) {
                  f.pose = targetP;
                } else if (f.pose === 'jump' || f.pose === 'jump_kick') {
                  f.pose = 'idle';
                }
              }
            }

            if (f.comboResetTimer > 0) {
              f.comboResetTimer--;
              if (f.comboResetTimer === 0) f.comboCount = 0;
            }
            return;
          }

          // Pre-jump 2-frame coil before actual liftoff
          if (f.jumpPending) {
            if (f.pose !== 'jump') {
              f.jumpPending = false;
            } else if (f.poseTimer <= 2) {
              f.vy = -15.5;
              f.jumpPending = false;
              f.wasAirborne = true;
              f.poseTimer = 0;
            }
          }

          f.x += f.vx;
          f.y += f.vy;
          if (f.y < GROUND_Y) {
            f.vy += GRAVITY;
            if (f.y < GROUND_Y - 2) f.wasAirborne = true;
          } else {
            f.y = GROUND_Y;
            f.vy = 0;
            if (f.wasAirborne) {
              f.wasAirborne = false;
              if (f.pose === 'jump' || f.pose === 'jump_kick') {
                f.pose = 'jump_land';
                f.poseTimer = 8;
                f.poseDuration = 8;
              }
            } else if (f.pose === 'jump_kick') {
              f.pose = 'idle';
            }
          }
          f.x = Math.max(48, Math.min(STAGE_W - 48, f.x));
          if (f.pose === 'hit' || f.pose === 'knockdown') f.vx *= 0.85;

          if (f.poseTimer > 0) {
            f.poseTimer--;
            if (f.poseTimer === 0 && !f.jumpPending && !['ko', 'dizzy', 'victory'].includes(f.pose)) {
              f.pose = f.y < GROUND_Y - 2 ? 'jump' : 'idle';
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
            const targetTop = target.isCrouching ? target.y - 42 : target.y - 102;
            const targetBot = target.isCrouching ? target.y - 4 : target.y;
            if (Math.abs(proj.x - target.x) < 28 && proj.y >= targetTop && proj.y <= targetBot) {
              if (target.isCrouching && proj.y < target.y - 46) {
                // Projectile passes overhead safely while crouching!
              } else {
                if (proj.chill) target.chillTimer = 180;
                applyHit(attacker, target, proj.damage, 'projectile', Boolean(proj.pull));
                return false;
              }
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

      // Firebase Multiplayer State Sync (20Hz smooth rate or immediate on attack, non-overlapping writes)
      if (isOnline && activeMatchIdRef.current && !st.onlineFinished) {
        const nowMs = performance.now();
        const hasPendingAttack = Boolean(pendingLocalAttackRef.current);
        const writeStale = isSyncWritingRef.current && nowMs - syncWriteStartMsRef.current > 350;
        const canWrite = !isSyncWritingRef.current || writeStale;

        if (canWrite && (hasPendingAttack || nowMs - lastNetworkSendMsRef.current >= 50)) {
          if (!isP2Client) {
            const act = pendingLocalAttackRef.current;
            const syncHash = `${Math.round(st.player.x)}_${Math.round(st.player.y)}_${Math.round(st.player.vx * 10)}_${st.player.facing}_${st.player.pose}_${localAttackNonceRef.current}_${st.player.hp}_${st.enemy.hp}_${p2HitSeqCounterRef.current}_${st.phase}_${st.timer}_${st.pWins}_${st.eWins}_${st.projectiles.length}`;
            if (hasPendingAttack || syncHash !== lastSentSnapHashRef.current || st.lastBannerSent) {
              lastSentSnapHashRef.current = syncHash;
              lastNetworkSendMsRef.current = nowMs;
              pendingLocalAttackRef.current = undefined;
              isSyncWritingRef.current = true;
              syncWriteStartMsRef.current = nowMs;
              const payload: Record<string, any> = {
                updatedAt: serverTimestamp(),
                hostSync: {
                  p1: {
                    x: Math.round(st.player.x),
                    y: Math.round(st.player.y),
                    vx: Number(st.player.vx.toFixed(1)),
                    vy: Number(st.player.vy.toFixed(1)),
                    facing: st.player.facing,
                    pose: st.player.pose,
                    poseTimer: st.player.poseTimer,
                    poseDuration: st.player.poseDuration,
                    isBlocking: st.player.isBlocking,
                    isCrouching: st.player.isCrouching,
                    attackNonce: localAttackNonceRef.current,
                    attackAction: act || null,
                    hp: st.player.hp,
                    energy: Math.round(st.player.energy),
                    chillTimer: st.player.chillTimer,
                    comboCount: st.player.comboCount,
                  },
                  p2Hp: st.enemy.hp,
                  p2Energy: Math.round(st.enemy.energy),
                  p2ChillTimer: st.enemy.chillTimer,
                  p2HitSeq: p2HitSeqCounterRef.current,
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
                    id: pr.id,
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
              updateDoc(doc(db, 'kombat_matches', activeMatchIdRef.current), payload)
                .catch(() => {})
                .finally(() => {
                  isSyncWritingRef.current = false;
                });
            }
          } else {
            const p2SnapHash = `${Math.round(st.enemy.x)}_${Math.round(st.enemy.y)}_${Math.round(st.enemy.vx * 10)}_${st.enemy.facing}_${st.enemy.pose}_${st.enemy.isBlocking}_${localAttackNonceRef.current}`;
            if (hasPendingAttack || p2SnapHash !== lastSentSnapHashRef.current) {
              lastSentSnapHashRef.current = p2SnapHash;
              lastNetworkSendMsRef.current = nowMs;
              const act = pendingLocalAttackRef.current;
              pendingLocalAttackRef.current = undefined;
              isSyncWritingRef.current = true;
              syncWriteStartMsRef.current = nowMs;
              updateDoc(doc(db, 'kombat_matches', activeMatchIdRef.current), {
                updatedAt: serverTimestamp(),
                p2Snap: {
                  x: Math.round(st.enemy.x),
                  y: Math.round(st.enemy.y),
                  vx: Number(st.enemy.vx.toFixed(1)),
                  vy: Number(st.enemy.vy.toFixed(1)),
                  facing: st.enemy.facing,
                  pose: st.enemy.pose,
                  poseTimer: st.enemy.poseTimer,
                  poseDuration: st.enemy.poseDuration,
                  isBlocking: st.enemy.isBlocking,
                  isCrouching: st.enemy.isCrouching,
                  attackNonce: localAttackNonceRef.current,
                  attackAction: act || null,
                  seq: p2SeqCounterRef.current++,
                },
              })
                .catch(() => {})
                .finally(() => {
                  isSyncWritingRef.current = false;
                });
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

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      st.particles.forEach((pt) => {
        const lifeRatio = Math.max(0, pt.life / pt.maxLife);
        const r = pt.size * (0.45 + lifeRatio * 0.65);
        ctx.globalAlpha = lifeRatio;
        const pGlow = ctx.createRadialGradient(pt.x, pt.y, 0.5, pt.x, pt.y, r * 1.45);
        pGlow.addColorStop(0, '#ffffff');
        pGlow.addColorStop(0.45, pt.color);
        pGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r * 1.45, 0, Math.PI * 2);
        ctx.fill();

        if (Math.hypot(pt.vx, pt.vy) > 1.5) {
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = Math.max(1.2, r * 0.45);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - pt.vx * 1.8, pt.y - pt.vy * 1.8);
          ctx.stroke();
        }
      });
      ctx.restore();
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
          fatalityVisual: st.phase === 'fatality_cinematic' ? prev.fatalityVisual : null,
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
    const curIdx = availableRoster.indexOf(selectedChar);
    const safeIdx = curIdx >= 0 ? curIdx : 0;
    const next = availableRoster[(safeIdx + dir + availableRoster.length) % availableRoster.length];
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
                : arcadeSubMode === 'solo'
                ? `SOLO STAGE ${arcadeStageIdx + 1}/${SOLO_STAGES.length} (${SOLO_STAGES[arcadeStageIdx]?.tierLabel || ''}) · ${(arcadeStageIdx === 0 ? ARENAS.find((a) => a.id === selectedStage)?.name : SOLO_STAGES[arcadeStageIdx]?.stageName) || ''} · R${roundNum}`
                : `${STORY_CAMPAIGNS[storyRoute].title} · CH ${arcadeStageIdx + 1}/${STORY_CAMPAIGNS[storyRoute].stages.length} · ${(arcadeStageIdx === 0 ? ARENAS.find((a) => a.id === selectedStage)?.name : STORY_CAMPAIGNS[storyRoute].stages[arcadeStageIdx]?.stageName) || ''} · R${roundNum}`
              : screen === 'story'
              ? `${STORY_CAMPAIGNS[storyRoute].title} · CHAPTER ${arcadeStageIdx + 1}/${STORY_CAMPAIGNS[storyRoute].stages.length}`
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
            <>
              <button
                onClick={togglePause}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border transition-colors',
                  isPaused
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                )}
                title="Tekan ESC untuk Menu Pause, Restart & Menu Utama"
              >
                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                <span>{isPaused ? 'Lanjut' : 'ESC · Menu'}</span>
              </button>
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
            </>
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
            <div className="relative w-full aspect-[16/9] min-h-[360px] flex flex-col items-center justify-end p-5 md:p-8 text-center">
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

              <div className="relative z-10 max-w-3xl w-full space-y-3">
                <div className="inline-flex items-center gap-2 text-[11px] md:text-xs font-black uppercase tracking-[0.25em] text-amber-300 bg-black/60 border border-amber-500/40 px-3.5 py-1 rounded-full">
                  <Flame size={15} className="text-red-500" /> ARCADE STORY ROUTES &amp; ONLINE MULTIPLAYER
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-500 to-red-600 drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                  INFORMATIKA KOMBAT
                </h1>
                <p className="text-xs md:text-sm text-slate-200 font-medium drop-shadow">
                  9 Arena Ikonik · Hero &amp; Monster Story Route · 3 Variasi <b>FATALITY Animasi Eksklusif</b> Tiap Petarung!
                </p>

                {/* Unified Title Preloader Progress Indicator (0% - 100%) */}
                <div className="max-w-md mx-auto bg-black/75 border border-slate-700/80 rounded-xl px-3.5 py-2 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-[11px] font-black mb-1">
                    <span className={spriteProgress.percent >= 100 ? 'text-emerald-400' : 'text-amber-300'}>
                      {spriteProgress.percent >= 100
                        ? 'SEMUA GAMBAR GAME SIAP BERTARUNG'
                        : `MEMUAT GAMBAR GAME... (${spriteProgress.loaded}/${spriteProgress.total})`}
                    </span>
                    <span className="text-white tabular-nums">{spriteProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-150 rounded-full',
                        spriteProgress.percent >= 100
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : 'bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300'
                      )}
                      style={{ width: `${spriteProgress.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      ensureAllGameAssetsLoaded();
                      selectArcadeMode('solo');
                      synthRef.current?.playSfx('gong');
                      setScreen('select');
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-600/35 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Swords size={18} /> SOLO 8 STAGE
                  </button>
                  <button
                    onClick={() => {
                      ensureAllGameAssetsLoaded();
                      selectArcadeMode('hero_story');
                      synthRef.current?.playSfx('gong');
                      setScreen('select');
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <BookOpen size={18} /> HERO ROUTE
                  </button>
                  <button
                    onClick={() => {
                      ensureAllGameAssetsLoaded();
                      selectArcadeMode('monster_story');
                      synthRef.current?.playSfx('gong');
                      setScreen('select');
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-rose-700 via-red-600 to-purple-700 hover:from-rose-600 hover:to-purple-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/35 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Flame size={18} /> MONSTER ROUTE
                  </button>
                  <button
                    onClick={() => {
                      ensureAllGameAssetsLoaded();
                      setPlayMode('online');
                      setMatchStatus('idle');
                      setMatchError(null);
                      synthRef.current?.playSfx('gong');
                      setScreen('select');
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Globe size={18} /> ONLINE DUEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'select' && (
          <div className="max-w-5xl w-full space-y-3">
            {/* Mode Switch Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-tight">
                  Pilih Pejuang &amp; Arena
                </h2>
                <p className="text-xs text-slate-400 font-semibold">
                  {playMode === 'online'
                    ? 'Online Duel: Semua 13 karakter tersedia untuk bertarung real-time!'
                    : arcadeSubMode === 'solo'
                    ? 'Solo Mode: Semua 13 karakter terbuka · Taklukkan 8 Stage yang makin menantang!'
                    : arcadeSubMode === 'hero_story'
                    ? 'Hero Route: Khusus memilih karakter faksi Hero (9 Pejuang) · 4 Chapter Cerita!'
                    : 'Monster Route: Khusus memilih karakter faksi Monster (4 Monster) · 4 Chapter Cerita!'}
                </p>
              </div>
              <div className="inline-flex flex-wrap justify-center bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1 shrink-0">
                <button
                  onClick={() => {
                    if (matchStatus === 'waiting') cancelMatchmaking();
                    selectArcadeMode('solo');
                    synthRef.current?.playSfx('select');
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                    playMode === 'arcade' && arcadeSubMode === 'solo'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Swords size={14} /> Solo (8 Stage)
                </button>
                <button
                  onClick={() => {
                    if (matchStatus === 'waiting') cancelMatchmaking();
                    selectArcadeMode('hero_story');
                    synthRef.current?.playSfx('select');
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                    playMode === 'arcade' && arcadeSubMode === 'hero_story'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  <BookOpen size={14} /> Hero Route
                </button>
                <button
                  onClick={() => {
                    if (matchStatus === 'waiting') cancelMatchmaking();
                    selectArcadeMode('monster_story');
                    synthRef.current?.playSfx('select');
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                    playMode === 'arcade' && arcadeSubMode === 'monster_story'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Flame size={14} /> Monster Route
                </button>
                <button
                  onClick={() => {
                    setPlayMode('online');
                    setMatchError(null);
                    synthRef.current?.playSfx('select');
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                    playMode === 'online' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Users size={14} /> Online
                </button>
              </div>
            </div>

            {spriteProgress.total > 0 && spriteProgress.percent < 100 && (
              <p className="text-[11px] font-bold text-amber-300 text-center">
                Menyiapkan Gambar Game... {spriteProgress.percent}% ({spriteProgress.loaded}/{spriteProgress.total})
              </p>
            )}

            {/* Solo 3 Modes Selector: Challenge | Free | Training */}
            {playMode === 'arcade' && arcadeSubMode === 'solo' && (
              <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setSoloVariant('challenge')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                        soloVariant === 'challenge' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                      )}
                    >
                      Challenge Mode (8 Stage)
                    </button>
                    <button
                      onClick={() => setSoloVariant('free')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                        soloVariant === 'free' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                      )}
                    >
                      Free Mode
                    </button>
                    <button
                      onClick={() => setSoloVariant('training')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                        soloVariant === 'training' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                      )}
                    >
                      Training Mode
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-amber-300">
                    {soloVariant === 'challenge'
                      ? 'Turnamen Tangga 8 Stage (Makin Sulit)'
                      : soloVariant === 'free'
                      ? 'Pertandingan Bebas (Pilih Kesukaran & Lawan)'
                      : 'Mode Latihan (Dummy & Auto-Regen HP)'}
                  </span>
                </div>

                {soloVariant === 'challenge' && (
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <p className="text-[11px] text-slate-300 font-medium">
                      Background Arena &amp; Tingkat Kesulitan otomatis berubah dari Stage 1 hingga Stage 8 (Final Boss).
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SOLO_STAGES.map((stItem, idx) => (
                        <span
                          key={stItem.stageName}
                          className={cn(
                            'text-[10px] font-black px-2 py-0.5 rounded border',
                            idx === SOLO_STAGES.length - 1
                              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                              : idx >= 4
                              ? 'bg-orange-950/60 border-orange-500/40 text-orange-200'
                              : 'bg-slate-950 border-slate-700 text-slate-200'
                          )}
                        >
                          S{idx + 1} · {stItem.tierLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {soloVariant === 'free' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">Tingkat Kesulitan Lawan:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['mudah', 'normal', 'sulit', 'elite'] as FreeDifficulty[]).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setFreeDifficulty(diff)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all border',
                              freeDifficulty === diff
                                ? 'bg-amber-500 text-slate-950 border-amber-300'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                            )}
                          >
                            {FREE_DIFFICULTY_CFG[diff].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">Pilih Lawan:</label>
                      <select
                        value={freeOpponent}
                        onChange={(e) => setFreeOpponent(e.target.value as FighterId | 'random')}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-amber-300 focus:outline-none focus:border-amber-400"
                      >
                        <option value="random">Acak (Random Opponent)</option>
                        {PLAYABLE_IDS.map((id) => (
                          <option key={id} value={id}>
                            {FIGHTERS[id].name} ({FIGHTERS[id].codename})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {soloVariant === 'training' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-800 items-center">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">Karakter Dummy:</label>
                      <select
                        value={trainingDummyChar}
                        onChange={(e) => setTrainingDummyChar(e.target.value as FighterId)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-amber-300 focus:outline-none focus:border-amber-400"
                      >
                        {PLAYABLE_IDS.map((id) => (
                          <option key={id} value={id}>
                            {FIGHTERS[id].name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">Perilaku Dummy:</label>
                      <div className="flex flex-wrap gap-1">
                        {(['diam', 'jongkok', 'blokir', 'serang'] as TrainingDummyBehavior[]).map((beh) => (
                          <button
                            key={beh}
                            onClick={() => setTrainingDummyBehavior(beh)}
                            className={cn(
                              'px-2 py-1 rounded text-[10px] font-black uppercase transition-all border',
                              trainingDummyBehavior === beh
                                ? 'bg-amber-500 text-slate-950 border-amber-300'
                                : 'bg-slate-950 text-slate-300 border-slate-800'
                            )}
                          >
                            {beh}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <label className="text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={trainingAutoRegen}
                          onChange={(e) => setTrainingAutoRegen(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                        />
                        Auto-Regen HP Pemain
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {playMode === 'arcade' && arcadeSubMode !== 'solo' && (() => {
              const camp = STORY_CAMPAIGNS[storyRoute];
              const isHero = storyRoute === 'hero';
              return (
                <div
                  className={cn(
                    'rounded-2xl p-3 border-2 bg-slate-900/95',
                    isHero
                      ? 'border-sky-400/70 bg-gradient-to-br from-slate-900 to-sky-950/45'
                      : 'border-rose-500/70 bg-gradient-to-br from-slate-900 to-rose-950/45'
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={cn('text-sm font-black tracking-wide', isHero ? 'text-sky-300' : 'text-rose-400')}>
                      {camp.title} · {camp.subtitle}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-black/50 border border-slate-700 text-amber-300">
                      {isHero ? 'Hanya Karakter Hero (9)' : 'Hanya Karakter Monster (4)'} · {camp.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{camp.intro}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {camp.stages.map((stItem, idx) => (
                      <span
                        key={stItem.fighter}
                        className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-950/85 border border-slate-700/80 text-slate-200"
                      >
                        {idx === camp.stages.length - 1 ? 'BOSS: ' : `${idx + 1}. `}
                        {FIGHTERS[stItem.fighter].name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Filtered Horizontal Side-by-Side KTP-Portrait Strip */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepSelectChar(-1)}
                className="w-10 h-28 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 active:scale-95 transition-all"
                title="Karakter Sebelumnya (←)"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex-1 flex flex-nowrap items-stretch gap-2.5 overflow-x-auto py-1.5 px-1 custom-scrollbar scroll-smooth">
                {availableRoster.map((fid) => {
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
                        'w-28 shrink-0 cursor-pointer rounded-2xl p-2 border-2 transition-all flex flex-col items-center text-center bg-slate-900/95 relative',
                        isSel
                          ? 'border-amber-400 shadow-lg shadow-amber-500/30 scale-[1.04] bg-gradient-to-b from-slate-800 to-slate-900'
                          : 'border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1.5 right-1.5 z-10 text-[8px] font-black px-1.5 py-0.5 rounded uppercase',
                          f.faction === 'hero'
                            ? 'bg-sky-500/25 text-sky-300 border border-sky-400/40'
                            : 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                        )}
                      >
                        {f.faction}
                      </span>
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
                  <span
                    className={cn(
                      'text-[10px] font-black px-2 py-0.5 rounded-full uppercase border',
                      selectedProfile.faction === 'hero'
                        ? 'bg-sky-500/15 text-sky-300 border-sky-400/40'
                        : 'bg-rose-500/15 text-rose-300 border-rose-400/40'
                    )}
                  >
                    {selectedProfile.faction === 'hero' ? 'Faksi Hero' : 'Faksi Monster'}
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
                  className={cn(
                    'px-6 py-3.5 text-white font-black rounded-xl shadow-lg shrink-0 active:scale-95 transition-all flex items-center gap-2',
                    arcadeSubMode === 'solo'
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500'
                      : storyRoute === 'hero'
                      ? 'bg-gradient-to-r from-sky-600 to-amber-500 hover:from-sky-500 hover:to-amber-400'
                      : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500'
                  )}
                >
                  {arcadeSubMode === 'solo' ? <Swords size={18} /> : <BookOpen size={18} />}
                  {arcadeSubMode === 'solo'
                    ? 'MULAI SOLO 8 STAGE! [ENTER]'
                    : `MULAI ${STORY_CAMPAIGNS[storyRoute].title}! [ENTER]`}
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

        {screen === 'story' && (() => {
          const campaign = STORY_CAMPAIGNS[storyRoute];
          const chapter = campaign.stages[arcadeStageIdx] || campaign.stages[0];
          const oppProfile = FIGHTERS[chapter.fighter];
          const chapterStageId: StageId = arcadeStageIdx === 0 ? selectedStage : chapter.stage;
          const arenaInfo = ARENAS.find((a) => a.id === chapterStageId) || ARENAS[0];
          return (
            <StoryCutsceneVideoPlayer
              route={storyRoute}
              chapter={chapter}
              chapterIdx={arcadeStageIdx}
              totalChapters={campaign.stages.length}
              arenaInfo={arenaInfo}
              playerProfile={selectedProfile}
              oppProfile={oppProfile}
              muted={muted}
              onToggleMute={() => {
                setMuted((m) => {
                  const next = !m;
                  if (synthRef.current) synthRef.current.setMuted(next);
                  return next;
                });
              }}
              onTriggerCue={(cue) => synthRef.current?.playSfx(cue)}
              onBackToSelect={() => setScreen('select')}
              onStartFight={() => launchStoryStage()}
            />
          );
        })()}

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

            {/* Exclusive Character-Specific Animated Fatality Artwork Overlay */}
            {hudState.fatalityVisual && (
              <div className="absolute inset-0 z-20 bg-black/95 flex items-center justify-center overflow-hidden pointer-events-none">
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    key={hudState.fatalityVisual.key}
                    src={hudState.fatalityVisual.imageUrl}
                    alt={hudState.fatalityVisual.fatalityName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain animate-fatality-art"
                  />
                  {/* Dynamic flash punch pulse & energy slash sweep */}
                  <div
                    className="absolute inset-0 animate-fatality-flash pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, #ffffff 0%, ${hudState.fatalityVisual.accent}88 45%, transparent 78%)`,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 w-1/3 animate-fatality-slash pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${hudState.fatalityVisual.accent}cc, #ffffff, ${hudState.fatalityVisual.accent}cc, transparent)`,
                    }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 80px ${hudState.fatalityVisual.accent}55`,
                    }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center justify-center px-4 text-center bg-gradient-to-t from-black/90 via-black/55 to-transparent py-3">
                  <div className="text-4xl sm:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-red-500 to-rose-900 drop-shadow-[0_4px_18px_rgba(220,38,38,0.95)]">
                    FATALITY!!
                  </div>
                  <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-200 drop-shadow mt-1">
                    {hudState.fatalityVisual.attackerName} WINS · {hudState.fatalityVisual.fatalityName} · +1500 BONUS
                  </div>
                </div>
              </div>
            )}

            {/* Pause / Restart / Main Menu Modal Overlay inside Arena (Triggered via ESC) */}
            {isPaused && (
              <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="max-w-xs w-full bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">Pertarungan Dijeda · [ESC]</p>
                    <h3 className="text-2xl font-black text-white mt-0.5">PAUSE</h3>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={togglePause}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Play size={16} /> Lanjutkan
                    </button>
                    {playMode === 'arcade' && (
                      <button
                        onClick={restartArenaMatch}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                      >
                        <RotateCcw size={16} /> Restart Pertarungan
                      </button>
                    )}
                    {playMode === 'arcade' && arcadeSubMode === 'solo' && (
                      <button
                        onClick={changeCharacterSolo}
                        className="w-full py-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Users size={16} /> Ganti Karakter
                      </button>
                    )}
                    <button
                      onClick={returnToMainMenu}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-rose-900/70 border border-slate-700 text-slate-100 font-black text-sm flex items-center justify-center gap-2"
                    >
                      <Home size={16} /> Kembali ke Menu Utama
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* In-Arena Floating Training Toolbar */}
            {playMode === 'arcade' && arcadeSubMode === 'solo' && engineRef.current?.soloVariant === 'training' && !isPaused && (
              <div className="absolute top-2 inset-x-2 z-30 bg-slate-950/85 backdrop-blur-md border border-amber-500/50 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase">Training Toolbar:</span>
                  <button
                    onClick={addTrainingDummy}
                    disabled={trainingDummyCount >= 3}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-black rounded-lg"
                  >
                    + Tambah Dummy
                  </button>
                  <button
                    onClick={removeTrainingDummy}
                    disabled={trainingDummyCount <= 1}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-[11px] font-black rounded-lg"
                  >
                    - Hapus Dummy
                  </button>
                  <span className="text-[11px] font-bold text-slate-300">({trainingDummyCount}/3 Dummies)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Perilaku:</span>
                    {(['diam', 'jongkok', 'blokir', 'serang'] as TrainingDummyBehavior[]).map((beh) => (
                      <button
                        key={beh}
                        onClick={() => setTrainingDummyBehavior(beh)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all',
                          trainingDummyBehavior === beh ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                        )}
                      >
                        {beh}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={cycleTrainingDummyChar}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[11px] font-black rounded-lg"
                    title="Ganti Karakter Dummy"
                  >
                    Dummy: {FIGHTERS[trainingDummyChar].name}
                  </button>
                  <button
                    onClick={resetTrainingArena}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[11px] font-black rounded-lg flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              </div>
            )}

            {/* In-Arena Floating Translucent Touch Controls (Rendered ONLY on touchscreens or when toggled on) */}
            {showTouchPad && !hudState.fatalityActive && !isPaused && (
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
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/40">
              <Trophy size={34} />
            </div>
            <div className="space-y-1">
              {!onlineOutcomeMsg && (
                <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {arcadeSubMode === 'solo'
                    ? 'SOLO 8 STAGE TAMAT'
                    : `${STORY_CAMPAIGNS[storyRoute].title} TAMAT`}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                {onlineOutcomeMsg
                  ? 'VICTORY ONLINE!'
                  : arcadeSubMode === 'solo'
                  ? 'JUARA TURNAMEN INFORMATIKA KOMBAT!'
                  : STORY_CAMPAIGNS[storyRoute].endingTitle}
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {onlineOutcomeMsg ||
                (arcadeSubMode === 'solo'
                  ? 'Luar biasa! Kamu berhasil menaklukkan seluruh 8 Stage Solo dengan tingkat kesulitan tertinggi termasuk Final Boss di Gerbang Kuantum!'
                  : STORY_CAMPAIGNS[storyRoute].endingText)}
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
                (arcadeSubMode === 'solo'
                  ? `Kamu gugur di Solo Stage ${arcadeStageIdx + 1}/${SOLO_STAGES.length} (${SOLO_STAGES[arcadeStageIdx]?.tierLabel || ''}) dengan skor ${score} poin. Gunakan kombinasi Block + Uppercut!`
                  : `Kamu gugur di ${STORY_CAMPAIGNS[storyRoute].title} Chapter ${arcadeStageIdx + 1}/${STORY_CAMPAIGNS[storyRoute].stages.length} dengan skor ${score} poin. Gunakan kombinasi Block + Uppercut!`)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMatchStatus('idle');
                  if (playMode === 'online') {
                    setScreen('select');
                  } else if (arcadeSubMode === 'solo') {
                    initRound(selectedChar, arcadeStageIdx, 1, 0, 0);
                    setScreen('arena');
                    if (!muted) synthRef.current?.startBgm();
                  } else {
                    launchStoryStage(arcadeStageIdx);
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 font-black rounded-xl text-sm"
              >
                {playMode === 'online'
                  ? 'Cari Lawan Lagi'
                  : arcadeSubMode === 'solo'
                  ? 'Coba Ulang Stage'
                  : 'Coba Ulang Chapter'}
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
