/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic } from './types';

export const PENGENALAN_POLA_TOPICS: Topic[] = [
  {
    id: 'konsep-pengenalan-pola',
    title: '1. Pengertian & Esensi Pengenalan Pola',
    icon: 'Search',
    content: `# Pengertian & Esensi Pengenalan Pola (Pattern Recognition)

**Pengenalan Pola (Pattern Recognition)** adalah pilar penting dalam **Berpikir Komputasional (Computational Thinking)** yang berfokus pada **kemampuan menemukan keteraturan, kesamaan, tren, siklus, atau karakteristik yang berulang** di antara berbagai data atau masalah.

---

## Mengapa Manusia & Komputer Membutuhkan Pola?

Otak manusia dan algoritma komputer sangat bergantung pada pengenalan pola karena:
1. **Memprediksi Masa Depan (*Prediction*)**: Jika suatu hal berulang secara teratur di masa lalu, kemungkinan besar hal itu akan terjadi lagi dengan cara yang sama di masa depan.
2. **Menghemat Waktu & Tenaga (*Efficiency*)**: Kita tidak perlu menciptakan solusi baru dari nol (*reinventing the wheel*) jika kita menyadari masalah yang dihadapi memiliki pola yang sama dengan masalah yang pernah kita selesaikan sebelumnya.
3. **Mengotomatisasi Pekerjaan (*Automation*)**: Ketika sebuah pola keteraturan berhasil dipetakan ke dalam aturan logis, komputer dapat menjalankannya jutaan kali secara otomatis tanpa lelah.

---

## 3 Komponen Utama Pengenalan Pola

* **Kesamaan (*Similarity*)**: Fitur atau karakteristik apa yang dimiliki bersama oleh objek-objek tersebut?
* **Perbedaan (*Difference*)**: Hal apa yang membedakan satu objek dari kelompok pola lainnya?
* **Frekuensi & Siklus (*Repetition & Frequency*)**: Seberapa sering peristiwa tersebut berulang dan apa pemicunya?

![Pengenalan Pola di Alam dan Kehidupan: Bunga Matahari, Sarang Lebah, dan Sidik Jari](/images/pengenalan_pola_alam_1794222968285.jpg)
`,
    quiz: [
      {
        question: "Apa tujuan utama dari pengenalan pola dalam berpikir komputasional?",
        options: [
          "Membagi tugas menjadi bagian-bagian terkecil",
          "Menemukan kesamaan, tren, atau keteraturan berulang untuk mempermudah prediksi dan solusi",
          "Membuat komputer terlihat canggih",
          "Mengabaikan semua informasi angka"
        ],
        correctAnswer: 1,
        explanation: "Pengenalan pola bertujuan mengidentifikasi keteraturan atau kesamaan yang berulang sehingga kita dapat memprediksi dan menerapkan solusi yang sudah terbukti efektif."
      },
      {
        question: "Jika kamu sudah pernah menyelesaikan masalah merakit meja kayu, bagaimana pengenalan pola membantumu saat harus merakit lemari kayu?",
        options: [
          "Kamu membuang buku petunjuk lemari",
          "Kamu mengenali pola penggunaan baut, engsel, dan urutan penyambungan papan yang serupa",
          "Kamu membatalkan pembelian lemari",
          "Kamu harus belajar ilmu pertukangan dari awal lagi"
        ],
        correctAnswer: 1,
        explanation: "Pola dasar konstruksi mebel (baut, engsel, sambungan kayu) serupa sehingga keahlian sebelumnya dapat langsung diterapkan."
      }
    ]
  },
  {
    id: 'pola-visual-teks-perilaku',
    title: '2. Ragam Pola: Visual, Teks, & Perilaku',
    icon: 'Eye',
    content: `# Ragam Pola: Visual, Teks, & Perilaku

Pola dapat muncul dalam berbagai bentuk di alam, kehidupan sosial, maupun dunia digital.

---

## 1. Pola Visual & Spasial
Keteraturan dalam bentuk geometris, warna, dan posisi ruang.
* **Alam Semesta:** Susunan kelopak bunga matahari (spiral Fibonacci), sarang lebah (pola heksagonal), garis-garis pada kulit zebra.
* **Arsitektur & Seni:** Motif batik kawung atau mega mendung, susunan keramik lantai, desain fasad gedung bertingkat.
* **Teknologi:** Sensor sidik jari (*fingerprint*) mencocokkan pola guratan garis lengkung pada kulit jarimu untuk membuka kunci smartphone.

---

## 2. Pola Teks & Bahasa (*Linguistic Patterns*)
Bahasa manusia penuh dengan keteraturan struktur:
* **Struktur Kalimat:** Pola Subjek + Predikat + Objek + Keterangan (S-P-O-K).
* **Format Dokumen:** Nomor Induk Kependudukan (NIK) memiliki pola kode provinsi + kode kota + tanggal lahir + nomor urut.
* **Format Email:** Pola \`nama_pengguna@domain.ekstensi\` (misal: \`budi@gmail.com\`). Komputer menggunakan pola ini untuk memvalidasi apakah input pengguna sah atau keliru.

---

## 3. Pola Perilaku & Siklus Waktu (*Behavioral & Temporal Patterns*)
Keteraturan aktivitas yang berulang seiring berjalannya waktu:
* **Lalu Lintas:** Jam sibuk macet jalan raya berpola setiap hari Senin - Jumat pukul 07.00 - 08.30 dan 16.30 - 18.30.
* **Cuaca:** Pola angin muson barat dan timur yang menentukan musim hujan dan kemarau di Indonesia.
* **Keuangan:** Pola pengeluaran rumah tangga yang biasanya memuncak pada awal bulan saat penerimaan gaji.

![Ragam Pola: Visual, Teks, dan Siklus Waktu](/images/pola_batik_lalin_teks_1794223208846.jpg)
`,
    quiz: [
      {
        question: "Sistem keamanan face recognition (pengenal wajah) di smartphone bekerja berdasarkan pengenalan pola jenis...",
        options: [
          "Pola teks",
          "Pola visual dan spasial",
          "Pola suara hewan",
          "Pola getaran gempa"
        ],
        correctAnswer: 1,
        explanation: "Face recognition memetakan kontur wajah, jarak antar mata, lekukan hidung, dan bentuk rahang yang merupakan data visual/spasial."
      },
      {
        question: "Manakah contoh pola keteraturan berbasis siklus waktu (temporal pattern)?",
        options: [
          "Bentuk heksagonal sarang lebah",
          "Kepadatan penumpang kereta rel listrik (KRL) pada jam berangkat dan pulang kerja",
          "Struktur penulisan alamat email",
          "Warna bendera merah putih"
        ],
        correctAnswer: 1,
        explanation: "Lonjakan penumpang KRL pada jam sibuk harian adalah contoh klasik pola berulang berdasarkan waktu/temporal."
      }
    ]
  },
  {
    id: 'pengenalan-pola-ai-teknologi',
    title: '3. Pengenalan Pola dalam AI & Sains Data',
    icon: 'Cpu',
    content: `# Pengenalan Pola dalam AI & Sains Data

Di era kecerdasan buatan (*Artificial Intelligence*), komputer dilatih untuk mengenali pola dari jutaan data dengan kecepatan luar biasa. Inilah dasar dari cabang ilmu **Machine Learning**.

---

## 1. Filter Spam Email
Bagaimana aplikasi email seperti Gmail mengetahui suatu pesan adalah pesan penipuan (*phishing/spam*) tanpa membacanya secara manual?
* Komputer dilatih mengenali **pola kata mencurigakan**: *"Selamat Anda memenangkan undian 1 Miliar"*, *"Klik tautan ini segera atau akun diblokir"*, *"Transfer uang sekarang"*.
* Jika sebuah email mengandung kombinasi pola kata tersebut dan dikirim dari alamat yang tidak terverifikasi, sistem otomatis memindahkannya ke folder **Spam**.

---

## 2. Sistem Rekomendasi (YouTube, Spotify, TikTok)
Pernahkah kamu heran mengapa beranda TikTok atau YouTube selalu menampilkan video yang kamu sukai?
* Algoritma mempelajari **pola perilaku tontonanmu**:
  - Topik apa yang kamu tonton sampai habis?
  - Akun mana yang kamu beri *like* atau bagikan ke teman?
  - Jam berapa kamu sering mendengarkan lagu santai?
* Dari pola tersebut, sistem menyimpulkan minatmu dan menyajikan konten serupa secara otomatis.

---

## 3. Prakiraan Cuaca & Pendeteksi Penyakit
* **Meteorologi:** Satelit cuaca membaca pola pergerakan awan dan tekanan udara untuk memprediksi apakah besok sore akan turun hujan lebat.
* **Medis:** Dokter menggunakan AI untuk mendeteksi pola bayangan putih abnormal pada citra sinar-X dada guna mendeteksi gejala radang paru-paru sedini mungkin.

![Pengenalan Pola dalam Kecerdasan Buatan (AI): Filter Spam dan Rekomendasi](/images/pola_spam_rekomendasi_1794223446533.jpg)
`,
    quiz: [
      {
        question: "Bagaimana algoritma Spotify dapat merekomendasikan lagu-lagu baru yang pas dengan seleramu?",
        options: [
          "Memilih lagu secara acak setiap hari",
          "Menganalisis pola genre, artis, tempo, dan lagu-lagu yang sering kamu dengarkan sebelumnya",
          "Menanyakan kepada orang tuamu",
          "Hanya memutar lagu yang paling mahal"
        ],
        correctAnswer: 1,
        explanation: "Sistem rekomendasi bekerja dengan mengekstrak pola preferensi musik pengguna dari histori lagu yang paling sering didengarkan."
      },
      {
        question: "Deteksi email spam oleh sistem komputasi memanfaatkan pengenalan pola pada...",
        options: [
          "Bentuk fisik casing komputer",
          "Kombinasi kata-kata penipuan berulang, tautan berbahaya, dan riwayat pengirim",
          "Kecepatan kipas prosesor server",
          "Ukuran monitor pengirim"
        ],
        correctAnswer: 1,
        explanation: "Filter spam menganalisis pola teks teks mencurigakan, kata kunci promosi berlebih, serta kebiasaan pengirim pesan."
      }
    ]
  },
  {
    id: 'pola-bilangan-aritmetika-geometri',
    title: '4. Pengenalan Pola Bilangan Aritmetika dan Geometri',
    icon: 'Calculator',
    content: `# Pengenalan Pola Bilangan Aritmetika dan Geometri

Sebagai penutup yang sangat penting dalam Berpikir Komputasional, mari kita pelajari bagaimana matematika memformalkan keteraturan angka ke dalam dua jenis pola fundamental: **Pola Aritmetika (Pola Selisih Tetap)** dan **Pola Geometri (Pola Perkalian/Rasio Tetap)**.

Kemampuan membedakan kedua jenis pola ini adalah contoh nyata penerapan berpikir komputasional tingkat tinggi!

![Perbandingan Pola Bilangan Aritmetika vs Geometri Buku Teks Matematika SMP](/images/pola_aritmetika_geometri_1794222968903.jpg)

---

## A. Pola Barisan Aritmetika (Penjumlahan / Pengurangan)

Barisan aritmetika adalah barisan bilangan di mana **selisih atau beda antara dua suku yang berurutan selalu bernilai tetap (konstan)**.

### Contoh Pola:
\`\`\`text
Urutan suku :  U₁    U₂    U₃    U₄    U₅
Nilai angka :  3     7     11    15    19  ...
Selisih     :    +4    +4    +4    +4
\`\`\`
Setiap melangkah ke suku berikutnya, angkanya selalu bertambah **+4**.

### Rumus Matematis:
1. **Rumus Beda (b):**
   > **b = Uₙ - Uₙ₋₁**  
   *(Contoh: b = 7 - 3 = 4)*

2. **Rumus Suku ke-n (Uₙ):**
   > 📐 **Uₙ = a + (n - 1) × b**

### Keterangan Variabel:
* **a** = Suku pertama mula-mula (U₁)
* **b** = Beda atau selisih antar dua suku
* **n** = Nomor urutan suku yang dicari
* **Uₙ** = Nilai bilangan pada suku ke-n

### Contoh Kasus Menemukan Suku ke-10:
* Suku pertama: **a = 3**
* Beda: **b = 4**
* Urutan suku: **n = 10**
* Perhitungan:
  **U₁₀ = a + (n - 1) × b**  
  **U₁₀ = 3 + (10 - 1) × 4**  
  **U₁₀ = 3 + 9 × 4**  
  **U₁₀ = 3 + 36 = 39**

---

## B. Pola Barisan Geometri (Perkalian / Pembagian Rasio)

Barisan geometri adalah barisan bilangan di mana **perbandingan atau rasio antara dua suku yang berurutan selalu bernilai tetap (konstan)**.

### Contoh Pola:
\`\`\`text
Urutan suku :  U₁    U₂    U₃    U₄    U₅
Nilai angka :  2     6     18    54    162 ...
Pengali     :    ×3    ×3    ×3    ×3
\`\`\`
Setiap melangkah ke suku berikutnya, angkanya selalu dikalikan **×3**.

### Rumus Matematis:
1. **Rumus Rasio (r):**
   > **r = Uₙ / Uₙ₋₁**  
   *(Contoh: r = 6 / 2 = 3)*

2. **Rumus Suku ke-n (Uₙ):**
   > 📐 **Uₙ = a × rⁿ⁻¹**

3. **Rumus Pertumbuhan Nyata (Siklus Pelipatgandaan dari Kondisi Awal):**
   > 📐 **U = a × rⁿ**  
   *(Digunakan pada soal cerita pertumbuhan bakteri atau penduduk setelah n kali periode)*

### Keterangan Variabel:
* **a** = Suku pertama atau jumlah mula-mula
* **r** = Rasio atau faktor pengali (kelipatan)
* **n** = Nomor urutan suku atau jumlah siklus pembelahan
* **Uₙ** = Nilai suku ke-n atau jumlah total akhir

### Contoh Kasus Menemukan Suku ke-5:
* Barisan: 2, 4, 8, 16, 32, ...
* Suku pertama: **a = 2**
* Rasio: **r = 4 / 2 = 2**
* Urutan suku: **n = 6**
* Perhitungan:
  **U₆ = a × r⁶⁻¹ = 2 × 2⁵ = 2 × 32 = 64**

---

## Tabel Perbandingan Cepat: Aritmetika vs Geometri

| Parameter | Barisan Aritmetika | Barisan Geometri |
| :--- | :--- | :--- |
| **Operasi Kunci** | Penjumlahan / Pengurangan tetap | Perkalian / Pembagian tetap |
| **Karakteristik Pengatur** | **Beda (b)** dengan pengurangan | **Rasio (r)** dengan pembagian |
| **Grafik Pertumbuhan** | Garis lurus linier | Kurva lengkung eksponensial |
| **Rumus Suku ke-n** | **Uₙ = a + (n - 1) × b** | **Uₙ = a × rⁿ⁻¹** |
| **Contoh Nyata** | Menabung Rp2.000 setiap minggu | Bakteri membelah diri jadi 2 setiap 20 menit |
`,
    quiz: [
      {
        question: "Diberikan barisan angka: 5, 9, 13, 17, ... Berdasarkan pengenalan pola, barisan ini termasuk jenis apa dan berapakah nilai pembedanya?",
        options: [
          "Barisan geometri dengan rasio r = 4",
          "Barisan aritmetika dengan beda b = 4",
          "Barisan geometri dengan rasio r = 5",
          "Barisan aritmetika dengan beda b = 5"
        ],
        correctAnswer: 1,
        explanation: "Pola angka bertambah dengan selisih tetap: 9 - 5 = 4, 13 - 9 = 4. Maka ini adalah barisan aritmetika dengan beda b = 4."
      },
      {
        question: "Diberikan barisan angka: 3, 6, 12, 24, 48, ... Pola apa yang mendasari barisan ini dan berapa suku ke-6?",
        options: [
          "Pola aritmetika bertambah 3; suku ke-6 adalah 51",
          "Pola geometri dikalikan 2 (rasio r = 2); suku ke-6 adalah 96",
          "Pola geometri dikalikan 3; suku ke-6 adalah 144",
          "Pola aritmetika bertambah 6; suku ke-6 adalah 60"
        ],
        correctAnswer: 1,
        explanation: "Setiap suku dikalikan 2 (r = 2). Suku ke-6: U₆ = 3 × 2⁶⁻¹ = 3 × 2⁵ = 3 × 32 = 96 (atau 48 × 2 = 96)."
      },
      {
        question: "Jika sebuah soal cerita menyatakan: 'Sebuah amuba membelah diri menjadi 2 setiap 15 menit', pola apakah yang paling tepat digunakan untuk menyelesaikannya?",
        options: [
          "Pola barisan aritmetika karena waktu bertambah",
          "Pola barisan geometri karena terjadi pelipatan jumlah secara eksponensial (faktor pengali r = 2)",
          "Bukan pola matematika melainkan biologi murni",
          "Pola pengurangan acak"
        ],
        correctAnswer: 1,
        explanation: "Proses pembelahan sel berlipat ganda merupakan karakteristik khas dari pola barisan geometri dengan rasio r = 2."
      }
    ]
  }
];
