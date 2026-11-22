export interface BackgroundPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  className: string;
}

export const APP_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: 'default',
    name: 'Minimalis Terang',
    category: 'Minimalis',
    description: 'Latar abu-abu terang bersih dan fokus untuk belajar.',
    className: 'app-bg-default',
  },
  {
    id: 'ocean-breeze',
    name: 'Gradasi Samudra',
    category: 'Gradasi',
    description: 'Nuansa biru langit dan samudra yang sejuk dan menenangkan.',
    className: 'app-bg-ocean-breeze',
  },
  {
    id: 'mint-fresh',
    name: 'Mint Segar',
    category: 'Gradasi',
    description: 'Paduan hijau mint dan toska yang segar untuk suasana kelas.',
    className: 'app-bg-mint-fresh',
  },
  {
    id: 'warm-sand',
    name: 'Pasir Hangat',
    category: 'Gradasi',
    description: 'Krem lembut dan keemasan hangat yang nyaman di mata.',
    className: 'app-bg-warm-sand',
  },
  {
    id: 'lavender-mist',
    name: 'Embun Lavender',
    category: 'Gradasi',
    description: 'Gradasi ungu lembut bernuansa modern dan kreatif.',
    className: 'app-bg-lavender-mist',
  },
  {
    id: 'sunset-pastel',
    name: 'Senja Pastel',
    category: 'Gradasi',
    description: 'Sentuhan mawar pastel dan persik lembut penuh energi positif.',
    className: 'app-bg-sunset-pastel',
  },
  {
    id: 'dot-matrix',
    name: 'Grid Titik Akademik',
    category: 'Pola',
    description: 'Pola titik buku catatan modern yang rapi dan terstruktur.',
    className: 'app-bg-dot-matrix',
  },
  {
    id: 'blueprint-grid',
    name: 'Kertas Milimeter',
    category: 'Pola',
    description: 'Kotak-kotak presisi bergaya cetak biru teknik informatika.',
    className: 'app-bg-blueprint-grid',
  },
  {
    id: 'diagonal-weave',
    name: 'Garis Geometris',
    category: 'Pola',
    description: 'Pola arsitektural garis diagonal halus yang berkelas.',
    className: 'app-bg-diagonal-weave',
  },
  {
    id: 'aurora-circuit',
    name: 'Aurora & Sirkuit',
    category: 'Artistik',
    description: 'Kombinasi cahaya aurora pastel dan motif sirkuit teknologi.',
    className: 'app-bg-aurora-circuit',
  },
];

export function getBackgroundPreset(presetId?: string): BackgroundPreset {
  return APP_BACKGROUNDS.find((bg) => bg.id === presetId) || APP_BACKGROUNDS[0];
}
