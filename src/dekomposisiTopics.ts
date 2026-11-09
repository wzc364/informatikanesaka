/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic } from './types';

export const DEKOMPOSISI_TOPICS: Topic[] = [
  {
    id: 'pengertian-dekomposisi',
    title: '1. Pengertian & Konsep Dasar Dekomposisi',
    icon: 'Puzzle',
    content: `# Pengertian & Konsep Dasar Dekomposisi

**Dekomposisi (Decomposition)** adalah salah satu dari 4 pilar utama dalam **Berpikir Komputasional (Computational Thinking)**. 

Secara harfiah, dekomposisi berarti **menguraikan, memecah, atau membagi suatu masalah, sistem, proses, atau tugas yang besar dan rumit menjadi bagian-bagian yang jauh lebih kecil, sederhana, mandiri, dan mudah dikelola (manageable)**.

---

## Mengapa Dekomposisi Sangat Penting?

Bayangkan jika kamu diminta:
> *"Tolong bangun sebuah rumah lengkap dua lantai!"*

Jika kamu memikirkan seluruh rumah sekaligus dalam satu waktu (atap, pondasi, listrik, pipa air, cat, jendela, keramik), otak kita akan merasa kewalahan (*cognitive overload*). 

Namun, dengan **Dekomposisi**, pekerjaan raksasa tersebut dipecah menjadi beberapa kelompok sub-pekerjaan:
1. **Sub-tugas Pondasi & Struktur**: Penggalian tanah, cor semen, tiang pancang.
2. **Sub-tugas Dinding & Atap**: Pemasangan bata, genteng, plester.
3. **Sub-tugas Utilitas**: Instalasi kabel listrik, sakelar, pipa saluran air bersih & kotor.
4. **Sub-tugas Finishing**: Pengecatan, pasang jendela, pasang ubin.

Ketika dibagi menjadi bagian-bagian kecil, setiap bagian dapat dikerjakan secara bertahap, lebih fokus, bahkan dapat dibagikan kepada spesialisnya masing-masing!

![Diagram Dekomposisi Desain Bangunan Modern dalam Buku Teks Siswa](/images/dekomposisi_rumah_alur_1794222964939.jpg)

---

## 4 Manfaat Utama Dekomposisi

1. **Mengurangi Kompleksitas (*Manageability*)**: Masalah yang awalnya tampak mustahil diselesaikan menjadi langkah-langkah yang realistis.
2. **Meningkatkan Fokus (*Focus & Clarity*)**: Kita bisa memusatkan perhatian pada satu masalah spesifik tanpa terganggu oleh bagian lain.
3. **Memungkinkan Kolaborasi & Kerja Paralel (*Division of Labor*)**: Bagian-bagian yang mandiri bisa dikerjakan bersamaan oleh beberapa orang atau beberapa prosesor komputer secara paralel.
4. **Mempermudah Pelacakan Masalah (*Debugging & Troubleshooting*)**: Jika terjadi kerusakan atau kesalahan, kita bisa mengisolasi bagian mana yang bermasalah tanpa harus memeriksa keseluruhan sistem.
`,
    quiz: [
      {
        question: "Apa pengertian utama dari dekomposisi dalam berpikir komputasi?",
        options: [
          "Menyembunyikan informasi yang tidak penting",
          "Memecah masalah yang kompleks menjadi bagian-bagian yang lebih kecil dan sederhana",
          "Mencari rumus matematika untuk menyelesaikan masalah",
          "Menulis kode pemrograman langsung ke dalam komputer"
        ],
        correctAnswer: 1,
        explanation: "Dekomposisi adalah teknik memecah masalah yang besar dan rumit menjadi bagian-bagian kecil yang mandiri agar lebih mudah dipahami dan dikerjakan."
      },
      {
        question: "Manakah yang merupakan keuntungan dari dekomposisi ketika bekerja dalam sebuah tim?",
        options: [
          "Semua anggota harus mengerjakan satu tugas yang sama secara bersamaan",
          "Pekerjaan dapat dibagi-bagi secara paralel sesuai bidang masing-masing",
          "Menghilangkan kebutuhan akan perencanaan",
          "Membuat proyek memakan waktu lebih lama"
        ],
        correctAnswer: 1,
        explanation: "Dengan dekomposisi, tugas-tugas kecil yang sudah terurai bisa didelegasikan kepada anggota tim yang berbeda untuk dikerjakan secara paralel."
      }
    ]
  },
  {
    id: 'tahapan-strategi-dekomposisi',
    title: '2. Tahapan & Strategi Melakukan Dekomposisi',
    icon: 'Layers',
    content: `# Tahapan & Strategi Melakukan Dekomposisi

Bagaimana cara seorang insinyur atau ilmuwan memecah masalah dengan benar? Dekomposisi bukan sekadar memotong-motong sembarangan, melainkan memerlukan analisis logis dan terstruktur.

---

## 4 Langkah Sistematis Dekomposisi

### Langkah 1: Pahami Tujuan Akhir (*Define the Goal*)
Ketahui apa hasil akhir yang ingin dicapai dan kriteria suksesnya.
* *Contoh:* "Membuat video presentasi tugas sekolah berdurasi 3 menit yang menarik."

### Langkah 2: Identifikasi Komponen Utama (*Identify High-Level Components*)
Tentukan pilar-pilar besar penyusun masalah tersebut.
* *Contoh:* Video presentasi terdiri dari: Naskah/Materi, Perekaman Audio/Video, dan Pengeditan Video (*Editing*).

### Langkah 3: Pecah Menjadi Sub-komponen Spesifik (*Breakdown into Sub-tasks*)
Uraikan masing-masing komponen besar menjadi tindakan-tindakan atomik (yang paling mendasar).
* **Naskah:**
  - Riset sumber materi
  - Penulisan poin penting
  - Pembagian durasi tiap slide
* **Produksi:**
  - Persiapan kamera / HP dan mikrofon
  - Pencahayaan ruangan
  - Pengambilan rekaman suara & video
* **Pascaproduksi (Editing):**
  - Pemotongan bagian salah (*cut*)
  - Penambahan teks penjelasan & musik latar
  - Ekspor ke format MP4

### Langkah 4: Tentukan Ketergantungan & Urutan (*Identify Dependencies*)
Tentukan sub-tugas mana yang harus selesai lebih dulu (*prerequisite*) dan mana yang bisa dikerjakan bersamaan.
* *Contoh:* Kita tidak bisa merekam audio (Langkah 3) sebelum naskah selesai ditulis (Langkah 1).

---

## Prinsip Penting: Independensi Modul (*Loose Coupling*)
Dalam ilmu komputer, sub-bagian hasil dekomposisi sebaiknya bersifat **mandiri**. Artinya, perubahan pada satu bagian seminimal mungkin mempengaruhi bagian yang lain.
`,
    quiz: [
      {
        question: "Apa langkah pertama yang harus dilakukan sebelum memecah suatu masalah?",
        options: [
          "Langsung membeli peralatan",
          "Mengetahui tujuan akhir dan kriteria hasil yang ingin dicapai",
          "Membagikan tugas kepada teman secara acak",
          "Menghapus bagian yang sulit"
        ],
        correctAnswer: 1,
        explanation: "Memahami tujuan akhir (Goal Definition) sangat penting agar pecahan masalah yang dibuat tetap terarah pada sasaran yang benar."
      },
      {
        question: "Mengapa penting mengetahui 'ketergantungan antar tugas' (task dependencies)?",
        options: [
          "Agar tahu tugas mana yang harus diselesaikan terlebih dahulu sebelum tugas lain dapat dimulai",
          "Agar kita bisa menunda semua pekerjaan",
          "Supaya biaya pengerjaan menjadi dua kali lipat",
          "Agar tidak perlu berdiskusi dengan orang lain"
        ],
        correctAnswer: 0,
        explanation: "Mengetahui dependencies membantu menentukan urutan logis langkah pengerjaan (misalnya: tidak bisa mengecat dinding sebelum dindingnya selesai dibangun)."
      }
    ]
  },
  {
    id: 'studi-kasus-kehidupan-nyata',
    title: '3. Studi Kasus Dekomposisi dalam Kehidupan Sehari-hari',
    icon: 'Brain',
    content: `# Studi Kasus Dekomposisi dalam Kehidupan Sehari-hari

Penerapan dekomposisi ada di sekitar kita setiap hari. Mari kita teliti contoh konkretnya:

---

### Kasus 1: Mengorganisasi Kegiatan Pentas Seni Sekolah
Jika panitia hanya mengatakan *"Ayo kita bikin pensi!"*, semua orang akan bingung harus mulai dari mana. Melalui dekomposisi, kegiatan dipecah ke dalam divisi fungsional:
* **Divisi Acara:** Menentukan tema, menyusun susunan acara (*rundown*), memilih pembawa acara (MC), mengatur pengisi acara.
* **Divisi Logistik & Perlengkapan:** Menyewa panggung, tata suara (*sound system*), tata lampu, tenda.
* **Divisi Konsumsi:** Menghitung jumlah makanan panitia dan pengisi acara, memesan katering.
* **Divisi Publikasi & Dokumentasi:** Mendesain poster, mengelola akun media sosial, memotret acara.

![Bagan Dekomposisi Panitia Pentas Seni Sekolah](/images/dekomposisi_pensi_sekolah_1794223205581.jpg)

---

### Kasus 2: Merawat Sepeda Motor yang Mogok
Seorang mekanik handal tidak langsung membongkar seluruh bagian motor secara acak. Ia mendekomposisi sistem kerja mesin motor menjadi 3 sistem independen:
1. **Sistem Bahan Bakar:** Apakah bensin masih ada? Apakah selang atau karburator/injektor tersumbat?
2. **Sistem Pengapian (Kelistrikan):** Apakah busi memercikkan api? Apakah aki memiliki voltase normal?
3. **Sistem Kompresi:** Apakah ruang bakar memiliki tekanan udara yang cukup?

Dengan memeriksa ketiga sub-sistem ini satu per satu, mekanik dapat menemukan sumber kerusakan dalam hitungan menit!

![Dekomposisi Analisis Kerusakan Mesin Sepeda Motor](/images/dekomposisi_motor_rusak_1794223207371.jpg)

---

### Kasus 3: Membuat Rencana Belajar Ujian Semester
Daripada panik dengan target *"Belajar semua materi kelas 8"*, dekomposisi membaginya menjadi:
* Berdasarkan Mata Pelajaran (Matematika, IPA, Bahasa Inggris, Informatika).
* Berdasarkan Bab dalam buku.
* Berdasarkan Jadwal Harian (Senin: Bab 1 Matematika, Selasa: Bab 2 Matematika).
* Berdasarkan Jenis Aktivitas (Membaca rangkuman → Latihan soal → Evaluasi kesalahan).
`,
    quiz: [
      {
        question: "Seorang koki ingin menyiapkan hidangan pesta untuk 100 orang. Bagaimana ia menerapkan dekomposisi?",
        options: [
          "Memasak satu porsi demi satu porsi dari awal sampai akhir 100 kali berturut-turut",
          "Membagi pekerjaan menjadi: persiapan bahan (potong sayur/daging), peracikan bumbu, proses memasak, dan penataan piring",
          "Menyuruh semua tamu memasak sendiri-sendiri",
          "Mengganti seluruh menu menjadi makanan instan tanpa persiapan"
        ],
        correctAnswer: 1,
        explanation: "Membagi persiapan bahan (mise en place), bumbu, memasak, dan plating adalah bentuk dekomposisi proses dapur profesional."
      },
      {
        question: "Saat mendiagnosis komputer yang tiba-tiba tidak ada suara, dekomposisi yang tepat adalah...",
        options: [
          "Langsung membuang komputer dan membeli yang baru",
          "Mengecek kabel speaker, pengaturan volume Windows, dan driver audio secara bertahap",
          "Mengganti monitor layar komputer",
          "Mengetik di keyboard secepat mungkin"
        ],
        correctAnswer: 1,
        explanation: "Memisahkan pengecekan antara perangkat keras (kabel/speaker), pengaturan perangkat lunak (volume/mute), dan driver sistem adalah dekomposisi sistem audio."
      }
    ]
  },
  {
    id: 'dekomposisi-dalam-informatika',
    title: '4. Dekomposisi dalam Dunia Informatika & Pemrograman',
    icon: 'Code',
    content: `# Dekomposisi dalam Dunia Informatika & Pemrograman

Dalam ilmu informatika dan rekayasa perangkat lunak (*software engineering*), dekomposisi adalah senjata nomor satu para arsitek sistem dan programmer.

---

## 1. Pemrograman Modular (Functions / Prosedur)
Daripada menulis 5.000 baris kode dalam satu berkas raksasa yang membingungkan, pemrogram memecah program menjadi fungsi-fungsi kecil yang melakukan satu tugas spesifik:
* \`hitungNilaiAkhir()\`
* \`validasiInputPassword()\`
* \`simpanDataKeDatabase()\`
* \`kirimNotifikasiWhatsApp()\`

Jika fungsi \`hitungNilaiAkhir()\` memiliki kesalahan hitung, programmer cukup memperbaiki fungsi tersebut tanpa khawatir merusak fungsi pengiriman notifikasi.

---

## 2. Dekomposisi Antarmuka Aplikasi (UI Components)
Aplikasi modern seperti Instagram, YouTube, atau Tokopedia dibangun dari komponen-komponen kecil yang dapat digunakan kembali (*reusable components*):
* **Komponen Tombol (*Button*)**
* **Komponen Bilah Pencarian (*Search Bar*)**
* **Komponen Kartu Produk (*Product Card*)**
* **Komponen Navigasi Bawah (*Bottom Navigation*)**

---

## 3. Dekomposisi Sistem Komputer (Hardware)
Komputer yang kita gunakan terdiri dari subsistem terdekomposisi yang berkomunikasi melalui antarmuka standar:
* **Unit Pemrosesan Pusat (CPU)**: Otak penghitung.
* **Memori Utama (RAM)**: Penyimpan data sementara berkecepatan tinggi.
* **Penyimpanan (SSD/HDD)**: Penyimpan data permanen.
* **Perangkat Masukan (Input)**: Keyboard, Mouse, Mikrofon.
* **Perangkat Keluaran (Output)**: Layar Monitor, Speaker, Printer.

![Dekomposisi Perangkat Komputer Meja Kerja Workshop](/images/dekomposisi_perangkat_pc_1794222967274.jpg)
`,
    quiz: [
      {
        question: "Dalam pemrograman, fungsi atau prosedur digunakan untuk menerapkan dekomposisi dengan cara...",
        options: [
          "Membuat komputer bekerja lebih lambat",
          "Memisahkan logika program menjadi modul-modul kecil yang memiliki tugas khusus",
          "Menghapus variabel penting",
          "Membuat tampilan layar menjadi hitam putih"
        ],
        correctAnswer: 1,
        explanation: "Fungsi/modul memecah logika besar menjadi blok-blok instruksi mandiri yang mudah diuji dan digunakan kembali (reusable)."
      },
      {
        question: "Manakah contoh dekomposisi komponen perangkat keras (hardware) komputer?",
        options: [
          "CPU, RAM, Hard Disk, dan Monitor",
          "Google Chrome, Microsoft Word, dan Windows",
          "File PDF, Lagu MP3, dan Foto JPG",
          "Internet, WiFi, dan Kuota Data"
        ],
        correctAnswer: 0,
        explanation: "CPU, RAM, media penyimpanan, dan monitor adalah subsistem penyusun perangkat keras komputer."
      }
    ]
  },
  {
    id: 'latihan-evaluasi-dekomposisi',
    title: '5. Evaluasi & Latihan Mandiri Dekomposisi',
    icon: 'Sparkles',
    content: `# Evaluasi & Latihan Mandiri Dekomposisi

Uji kemampuan analisismu dalam mendekomposisi berbagai tantangan di bawah ini!

---

## Contoh Analisis Kasus: "Aplikasi Kasir Toko Kelontong"
Jika kamu diminta merancang sistem kasir sederhana, bagaimana pohon dekomposisi masalahnya?

\`\`\`text
Sistem Kasir Toko
├── 1. Modul Manajemen Barang
│   ├── Tambah barang baru (Nama, Barcode, Harga)
│   ├── Ubah harga jual
│   └── Pantau stok menipis
├── 2. Modul Transaksi Pembayaran
│   ├── Pindai (scan) barcode barang
│   ├── Hitung total belanja & pajak
│   ├── Terima uang bayar & hitung kembalian
│   └── Cetak struk belanja
└── 3. Modul Laporan Penjualan
    ├── Total pemasukan harian
    ├── Daftar barang terlaris
    └── Ekspor laporan ke PDF / Excel
\`\`\`

![Diagram Dekomposisi Sistem Kasir Toko Kelontong](/images/dekomposisi_pohon_kasir_1794223208139.jpg)

---

## Tips Utama Menyelesaikan Soal Dekomposisi:
1. **Ajukan Pertanyaan 5W + 1H**: Apa saja bahannya? Siapa yang mengerjakannya? Di mana letaknya? Kapan dilakukan? Mengapa diperlukan? Bagaimana langkahnya?
2. **Gunakan Diagram Pohon (*Tree Diagram*)**: Buat cabang dari topik utama ke sub-topik, lalu ke detail teknis.
3. **Uji Kelengkapan**: Jika semua pecahan kecil disatukan kembali, apakah masalah utamanya selesai dengan sempurna?
`,
    quiz: [
      {
        question: "Jika kamu diminta membuat game labirin sederhana, manakah dekomposisi fitur yang paling lengkap dan logis?",
        options: [
          "Hanya membuat suara musik pengiring",
          "Peta dinding labirin, kontrol pergerakan pemain, deteksi tabrakan dinding, dan titik keluar (finish)",
          "Menentukan harga jual game di toko aplikasi",
          "Mengganti warna kabel komputer"
        ],
        correctAnswer: 1,
        explanation: "Game labirin membutuhkan modul desain rintangan/peta, mekanisme kontrol karakter, logika tabrakan (collision detection), serta kondisi kemenangan (finish goal)."
      },
      {
        question: "Apa tanda bahwa suatu proses dekomposisi sudah cukup dan tidak perlu dipecah lebih jauh lagi?",
        options: [
          "Saat sub-tugas sudah dapat langsung dikerjakan atau diimplementasikan dengan jelas tanpa kebingungan",
          "Saat kita sudah merasa lelah menulis",
          "Saat semua kata disingkat menjadi satu huruf",
          "Saat masalah menjadi semakin rumit dan sulit"
        ],
        correctAnswer: 0,
        explanation: "Dekomposisi mencapai batas ideal (atomic task) ketika sub-tugas sudah jelas, spesifik, dan dapat langsung dieksekusi tanpa interpretasi ambigu."
      }
    ]
  }
];
