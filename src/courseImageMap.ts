import algoDailyStepsImg from './assets/images/algo_daily_steps_1794140225028.jpg';
import flowchartSymbolsGuideImg from './assets/images/flowchart_symbols_guide_1794140225483.jpg';
import pseudocodeConceptVisualImg from './assets/images/pseudocode_concept_visual_1794140227104.jpg';
import circleGeometryFormulaImg from './assets/images/circle_geometry_formula_1794140226056.jpg';
import loopingCycleConceptImg from './assets/images/looping_cycle_concept_1794140226079.jpg';

import scratchInterfaceImg from './assets/images/scratch_interface_1794090375318.jpg';
import scratchCoordinatesImg from './assets/images/scratch_coordinates_1794090375658.jpg';
import scratchBlocksImg from './assets/images/scratch_blocks_1794090375516.jpg';
import scratchLoopsLogicImg from './assets/images/scratch_loops_logic_1794090377114.jpg';
import scratchGameProjectImg from './assets/images/scratch_game_project_1794090376798.jpg';

import dekomposisiRumahAlurImg from './assets/images/dekomposisi_rumah_alur_1794222964939.jpg';
import dekomposisiPensiSekolahImg from './assets/images/dekomposisi_pensi_sekolah_1794223205581.jpg';
import dekomposisiMotorRusakImg from './assets/images/dekomposisi_motor_rusak_1794223207371.jpg';
import dekomposisiPerangkatPcImg from './assets/images/dekomposisi_perangkat_pc_1794222967274.jpg';
import dekomposisiPohonKasirImg from './assets/images/dekomposisi_pohon_kasir_1794223208139.jpg';

import pengenalanPolaAlamImg from './assets/images/pengenalan_pola_alam_1794222968285.jpg';
import polaBatikLalinTeksImg from './assets/images/pola_batik_lalin_teks_1794223208846.jpg';
import polaSpamRekomendasiImg from './assets/images/pola_spam_rekomendasi_1794223446533.jpg';
import polaAritmetikaGeometriImg from './assets/images/pola_aritmetika_geometri_1794222968903.jpg';

import heroPolaBilanganImg from './assets/images/hero_pola_bilangan_1794221595492.jpg';
import bakteriGeometriSplitImg from './assets/images/bakteri_geometri_split_1794221595982.jpg';
import tanamanGeometriStekImg from './assets/images/tanaman_geometri_stek_1794221597110.jpg';
import tabunganAritmetikaStepImg from './assets/images/tabungan_aritmetika_step_1794221597240.jpg';

import labkomNesakaLogoImg from './assets/images/labkom_nesaka_logo_1794188294584.jpg';

const BUNDLED_IMAGE_BY_FILENAME: Record<string, string> = {
  'algo_daily_steps.jpg': algoDailyStepsImg,
  'algo_daily_steps_1794140225028.jpg': algoDailyStepsImg,
  'flowchart_symbols_guide.jpg': flowchartSymbolsGuideImg,
  'flowchart_symbols_guide_1794140225483.jpg': flowchartSymbolsGuideImg,
  'pseudocode_concept_visual.jpg': pseudocodeConceptVisualImg,
  'pseudocode_concept_visual_1794140227104.jpg': pseudocodeConceptVisualImg,
  'circle_geometry_formula.jpg': circleGeometryFormulaImg,
  'circle_geometry_formula_1794140226056.jpg': circleGeometryFormulaImg,
  'looping_cycle_concept.jpg': loopingCycleConceptImg,
  'looping_cycle_concept_1794140226079.jpg': loopingCycleConceptImg,

  'scratch_interface_1794090375318.jpg': scratchInterfaceImg,
  'scratch_coordinates_1794090375658.jpg': scratchCoordinatesImg,
  'scratch_blocks_1794090375516.jpg': scratchBlocksImg,
  'scratch_loops_logic_1794090377114.jpg': scratchLoopsLogicImg,
  'scratch_game_project_1794090376798.jpg': scratchGameProjectImg,

  'dekomposisi_rumah_alur_1794222964939.jpg': dekomposisiRumahAlurImg,
  'dekomposisi_pensi_sekolah_1794223205581.jpg': dekomposisiPensiSekolahImg,
  'dekomposisi_motor_rusak_1794223207371.jpg': dekomposisiMotorRusakImg,
  'dekomposisi_perangkat_pc_1794222967274.jpg': dekomposisiPerangkatPcImg,
  'dekomposisi_pohon_kasir_1794223208139.jpg': dekomposisiPohonKasirImg,

  'pengenalan_pola_alam_1794222968285.jpg': pengenalanPolaAlamImg,
  'pola_batik_lalin_teks_1794223208846.jpg': polaBatikLalinTeksImg,
  'pola_spam_rekomendasi_1794223446533.jpg': polaSpamRekomendasiImg,
  'pola_aritmetika_geometri_1794222968903.jpg': polaAritmetikaGeometriImg,

  'hero_pola_bilangan_1794221595492.jpg': heroPolaBilanganImg,
  'bakteri_geometri_split_1794221595982.jpg': bakteriGeometriSplitImg,
  'tanaman_geometri_stek_1794221597110.jpg': tanamanGeometriStekImg,
  'tabungan_aritmetika_step_1794221597240.jpg': tabunganAritmetikaStepImg,

  'labkom_nesaka_logo.jpg': labkomNesakaLogoImg,
  'labkom_nesaka_logo_1794188294584.jpg': labkomNesakaLogoImg,
};

/**
 * Resolves markdown/material image URLs to Vite-bundled asset URLs when available,
 * ensuring images load reliably in dev, production builds, iframes, and print/PDF exports.
 */
export function resolveCourseImageUrl(src?: string | null): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const cleanPath = trimmed.split(/[?#]/)[0];
  const fileName = cleanPath.split('/').pop() || '';
  if (fileName && BUNDLED_IMAGE_BY_FILENAME[fileName]) {
    return BUNDLED_IMAGE_BY_FILENAME[fileName];
  }

  return trimmed;
}

export function getPublicFallbackImageUrl(src?: string | null): string | null {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
    return null;
  }
  const cleanPath = trimmed.split(/[?#]/)[0];
  const fileName = cleanPath.split('/').pop() || '';
  return fileName ? `/images/${fileName}` : null;
}
