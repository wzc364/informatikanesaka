/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic } from './types';

export const POLA_BILANGAN_TOPICS: Topic[] = [
  {
    id: 'konsep-dasar-rumus',
    title: '1. Konsep Dasar & Panduan Bedah Variabel',
    icon: 'Brain',
    content: `
# Konsep Dasar Pola Bilangan Geometri dan Aritmetika

Untuk menyelesaikan soal pola bilangan (terutama soal cerita), kunci utamanya adalah **mampu menerjemahkan setiap kalimat soal menjadi variabel matematis**.

![Infografis Perbandingan Barisan Geometri vs Aritmetika](/src/assets/images/hero_pola_bilangan_1794221595492.jpg)

---

## 1. Barisan Geometri (Pola Perkalian)
Barisan geometri adalah barisan bilangan yang memiliki **perbandingan atau rasio tetap** antara dua suku berurutan.

* **Contoh:** 2, 4, 8, 16, 32, ... *(setiap suku dikali 2)*
* **Rumus Rasio (r):**
  > **r = Uₙ / Uₙ₋₁**
* **Rumus Suku ke-n (Un):**
  > 📐 **Uₙ = a × rⁿ⁻¹**
* **Rumus Pertumbuhan Nyata (dari kondisi awal n = 0):**
  > 📐 **U = a × rⁿ**

### 📌 Variabel Penting:
* **a** = Nilai/suku pertama mula-mula
* **r** = Rasio (faktor kelipatan: *membelah jadi 2*, *berlipat ganda*, dsb.)
* **n** = Jumlah siklus/periode kejadian atau nomor urutan suku
* **Uₙ** = Nilai suku ke-n atau jumlah akhir

---

## 2. Barisan Aritmetika (Pola Penjumlahan)
Barisan aritmetika adalah barisan bilangan yang memiliki **selisih atau beda tetap** antara dua suku berurutan.

* **Contoh:** 2, 4, 6, 8, 10, ... *(setiap suku bertambah 2)*
* **Rumus Beda (b):**
  > **b = Uₙ - Uₙ₋₁**
* **Rumus Suku ke-n (Un):**
  > 📐 **Uₙ = a + (n - 1) × b**

### 📌 Variabel Penting:
* **a** = Nilai/suku pertama mula-mula
* **b** = Beda atau selisih tetap (*bertambah Rp2.000*, *bertambah 4 kursi*, dsb.)
* **n** = Nomor urutan suku atau urutan periode
* **Uₙ** = Nilai suku ke-n

---

## 💡 Panduan Membedah Kalimat Soal Cerita:
1. **Kalimat Kondisi Awal** → Menjadi variabel **a** (suku pertama mula-mula).
2. **Kalimat Pola Perubahan:**
   * Jika menyebutkan *"berlipat dua/tiga"*, *"membelah diri"* → Menjadi rasio **r** (Geometri).
   * Jika menyebutkan *"bertambah sekian"*, *"selisih tetap"* → Menjadi beda **b** (Aritmetika).
3. **Kalimat Waktu/Tahap** → Menentukan jumlah periode **n** (n = Total Waktu / Waktu Siklus).
4. **Kalimat Pertanyaan** → Menentukan target yang dicari (**Uₙ**, **a**, **r**, **b**, atau **n**).
    `,
    quiz: [
      {
        question: "Jika sebuah soal cerita menyatakan: 'Sebuah organisme membelah diri menjadi dua setiap 15 menit', maka nilai 'membelah diri menjadi dua' diterjemahkan ke dalam variabel matematis apa?",
        options: ["Rasio (r = 2) pada barisan geometri", "Beda (b = 2) pada barisan aritmetika", "Suku pertama (a = 2)", "Banyak suku (n = 2)"],
        correctAnswer: 0,
        explanation: "Kata kunci 'membelah diri menjadi dua' menunjukkan operasi perkalian berlipat ganda, yang merupakan rasio (r = 2) pada barisan geometri."
      },
      {
        question: "Jika soal cerita menyatakan: 'Setiap minggu tabungannya ditambah sebesar Rp3.000', nilai ini diterjemahkan ke dalam variabel apa?",
        options: ["Beda (b = 3.000) pada barisan aritmetika", "Rasio (r = 3.000) pada barisan geometri", "Suku awal (a = 3.000)", "Nomor urut (n = 3.000)"],
        correctAnswer: 0,
        explanation: "Kata kunci 'ditambah sebesar Rp3.000' secara berkala menunjukkan penambahan tetap, yaitu beda (b = 3.000) pada barisan aritmetika."
      }
    ]
  },
  {
    id: 'soal-1-2-geometri',
    title: '2. Soal 1 & 2: Pertumbuhan Bakteri & Penduduk',
    icon: 'Sparkles',
    content: `
# Pembahasan Soal Cerita Barisan Geometri

---

### Soal 1. Pertumbuhan Bakteri
> *"Sebuah bakteri membelah diri menjadi dua setiap 20 menit. Pada awal pengamatan terdapat 4 bakteri. Berapa jumlah bakteri setelah 2 jam?"*

![Diagram Tahapan Pembelahan Biner Bakteri Setiap 20 Menit](/src/assets/images/bakteri_geometri_split_1794221595982.jpg)

#### Pilihan Jawaban:
* **a)** 256
* **b)** 128
* **c)** 512
* **d)** 228

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Sebuah bakteri membelah diri menjadi dua setiap 20 menit."*
   * 👉 **Variabel Rasio (r):** **r = 2** *(karena membelah diri menjadi dua)*.
   * 👉 **Variabel Siklus Waktu:** **20 menit per pembelahan**.
   * 👉 **Jenis Pola:** Barisan Geometri *(karena pelipatan perkalian)*.
2. 🔹 **Kalimat 2:** *"Pada awal pengamatan terdapat 4 bakteri."*
   * 👉 **Variabel Suku Awal (a):** **a = 4** *(kondisi awal sebelum pembelahan)*.
3. 🔹 **Kalimat 3:** *"Berapa jumlah bakteri setelah 2 jam?"*
   * 👉 **Konversi Satuan:** 2 jam = **120 menit**.
   * 👉 **Variabel Banyaknya Periode (n):** **n = 120 / 20 = 6 kali pembelahan**.
   * 👉 **Variabel yang Dicari:** Jumlah akhir bakteri (**U**).

#### Langkah Penyelesaian:
Karena a = 4 adalah jumlah mula-mula sebelum pembelahan ke-1:
> **U = a × rⁿ**  
> **U = 4 × 2⁶**  
> **U = 4 × 64 = 256 bakteri**

* **Kunci Jawaban:** **a) 256**
* **Penjelasan:** Dalam 120 menit terjadi 6 kali pembelahan (2⁶ = 64). Dari 4 bakteri awal menghasilkan 4 × 64 = 256 bakteri.

---

### Soal 2. Pertumbuhan Penduduk
> *"Sebuah desa mengalami perkembangan jumlah penduduk yang cukup pesat. Berdasarkan hasil pengamatan, jumlah penduduk di suatu kawasan baru bertambah menjadi dua kali lipat setiap 5 tahun. Pada awal pendataan, kawasan tersebut memiliki 200 penduduk. Jika pertumbuhan penduduk berlangsung secara teratur, berapakah jumlah penduduk di kawasan tersebut setelah 20 tahun?"*

#### Pilihan Jawaban:
* **a)** 3.200
* **b)** 3000
* **c)** 3128
* **d)** 3064

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Sebuah desa mengalami perkembangan jumlah penduduk yang cukup pesat."*
   * 👉 Konteks narasi soal demografi.
2. 🔹 **Kalimat 2:** *"Berdasarkan hasil pengamatan, jumlah penduduk di suatu kawasan baru bertambah menjadi dua kali lipat setiap 5 tahun."*
   * 👉 **Variabel Rasio (r):** **r = 2** *(bertambah 2 kali lipat)*.
   * 👉 **Variabel Durasi Siklus:** **5 tahun per periode**.
3. 🔹 **Kalimat 3:** *"Pada awal pendataan, kawasan tersebut memiliki 200 penduduk."*
   * 👉 **Variabel Jumlah Awal (a):** **a = 200**.
4. 🔹 **Kalimat 4:** *"Jika pertumbuhan penduduk berlangsung secara teratur, berapakah jumlah penduduk di kawasan tersebut setelah 20 tahun?"*
   * 👉 **Variabel Banyak Periode (n):** **n = 20 tahun / 5 tahun = 4 kali pelipatan**.
   * 👉 **Variabel yang Dicari:** Jumlah akhir penduduk (**U**).

#### Langkah Penyelesaian:
> **U = a × rⁿ**  
> **U = 200 × 2⁴**  
> **U = 200 × 16 = 3.200 penduduk**

* **Kunci Jawaban:** **a) 3.200**
* **Penjelasan:** Selama 20 tahun terjadi 20 / 5 = 4 kali pelipatan. Jumlah penduduk menjadi 200 × 16 = 3.200 jiwa.
    `,
    quiz: [
      {
        question: "Sebuah bakteri membelah diri menjadi dua setiap 20 menit. Pada awal pengamatan terdapat 4 bakteri. Berapa jumlah bakteri setelah 2 jam?",
        options: ["256", "128", "512", "228"],
        correctAnswer: 0,
        explanation: "a = 4, r = 2. Waktu 2 jam = 120 menit -> n = 120/20 = 6. Jumlah akhir = 4 × 2^6 = 4 × 64 = 256 bakteri."
      },
      {
        question: "Jumlah penduduk bertambah menjadi dua kali lipat setiap 5 tahun. Pada awal pendataan terdapat 200 penduduk. Berapakah jumlah penduduk di kawasan tersebut setelah 20 tahun?",
        options: ["3.200", "3000", "3128", "3064"],
        correctAnswer: 0,
        explanation: "a = 200, r = 2. n = 20/5 = 4 kali pelipatan. U = 200 × 2^4 = 200 × 16 = 3.200 penduduk."
      }
    ]
  },
  {
    id: 'soal-3-4-geometri',
    title: '3. Soal 3 & 4: Pertumbuhan Tanaman & Ikan',
    icon: 'Variable',
    content: `
# Pembahasan Soal Cerita Barisan Geometri (Lanjutan)

---

### Soal 3. Pertumbuhan Tanaman
> *"Seorang petani melakukan percobaan menanam tanaman hias dengan metode stek. Setiap tanaman yang berhasil tumbuh kemudian menghasilkan dua tunas baru dalam setiap tahap pertumbuhan. Pada tahap awal terdapat 3 tanaman. Jika jumlah tanaman terus bertambah menjadi dua kali lipat pada setiap tahap, pada tahap ke berapakah jumlah tanaman mencapai 192 tanaman?"*

![Diagram Tahapan Pertumbuhan Tanaman Stek dengan Pelipatan Tunas](/src/assets/images/tanaman_geometri_stek_1794221597110.jpg)

#### Pilihan Jawaban:
* **a)** tahap-6
* **b)** tahap-5
* **c)** tahap-4
* **d)** tahap-3

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Seorang petani melakukan percobaan menanam tanaman hias dengan metode stek."*
   * 👉 Konteks narasi soal pertanian.
2. 🔹 **Kalimat 2 & 4:** *"Setiap tanaman yang berhasil tumbuh kemudian menghasilkan dua tunas baru... jumlah tanaman terus bertambah menjadi dua kali lipat pada setiap tahap..."*
   * 👉 **Variabel Rasio (r):** **r = 2** *(berlipat 2 setiap tahap)*.
3. 🔹 **Kalimat 3:** *"Pada tahap awal terdapat 3 tanaman."*
   * 👉 **Variabel Jumlah Awal (a):** **a = 3**.
4. 🔹 **Kalimat 4:** *"...pada tahap ke berapakah jumlah tanaman mencapai 192 tanaman?"*
   * 👉 **Variabel Jumlah Akhir (U):** **U = 192**.
   * 👉 **Variabel yang Dicari:** Nomor tahap pertumbuhan (**n**).

#### Langkah Penyelesaian:
> **U = a × rⁿ**  
> **192 = 3 × 2ⁿ**  
> **2ⁿ = 192 / 3**  
> **2ⁿ = 64**  
Karena 64 = 2⁶, maka didapat **n = 6**.

* **Kunci Jawaban:** **a) tahap-6**
* **Penjelasan:** Dari 3 tanaman menjadi 192 tanaman membutuhkan 6 kali pelipatan (3 × 2⁶ = 192), yaitu pada tahap ke-6.

---

### Soal 4. Pertumbuhan Ikan
> *"Seorang peternak ikan mengamati perkembangan jumlah ikan di sebuah kolam. Setiap bulan, jumlah ikan menjadi dua kali lipat dari jumlah pada bulan sebelumnya. Setelah dilakukan pengamatan selama 5 bulan, jumlah ikan di kolam tersebut mencapai 320 ekor. Jika pertumbuhan ikan berlangsung secara teratur, berapakah jumlah ikan pada awal pengamatan?"*

#### Pilihan Jawaban:
* **a)** 5 ekor
* **b)** 10 ekor
* **c)** 15 ekor
* **d)** 20 ekor

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Seorang peternak ikan mengamati perkembangan jumlah ikan di sebuah kolam."*
   * 👉 Konteks narasi budidaya ikan.
2. 🔹 **Kalimat 2:** *"Setiap bulan, jumlah ikan menjadi dua kali lipat dari jumlah pada bulan sebelumnya."*
   * 👉 **Variabel Rasio (r):** **r = 2**.
   * 👉 **Siklus:** Setiap 1 bulan.
3. 🔹 **Kalimat 3:** *"Setelah dilakukan pengamatan selama 5 bulan, jumlah ikan di kolam tersebut mencapai 320 ekor."*
   * 👉 **Variabel Jumlah Periode (n):** **n = 5 bulan**.
   * 👉 **Variabel Jumlah Akhir (U):** **U = 320 ekor**.
4. 🔹 **Kalimat 4:** *"Jika pertumbuhan ikan berlangsung secara teratur, berapakah jumlah ikan pada awal pengamatan?"*
   * 👉 **Variabel yang Dicari:** Jumlah ikan pada kondisi awal mula-mula (**a**).

#### Langkah Penyelesaian:
> **U = a × rⁿ**  
> **320 = a × 2⁵**  
> **320 = a × 32**  
> **a = 320 / 32 = 10 ekor**

* **Kunci Jawaban:** **b) 10 ekor**
* **Penjelasan:** Jumlah awal diperoleh dengan membagi jumlah akhir (320) dengan faktor pertumbuhan (2⁵ = 32), menghasilkan 10 ekor.
    `,
    quiz: [
      {
        question: "Pada tahap awal terdapat 3 tanaman. Jika tanaman berlipat dua setiap tahap, pada tahap ke berapakah tanaman mencapai 192 tanaman?",
        options: ["tahap-6", "tahap-5", "tahap-4", "tahap-3"],
        correctAnswer: 0,
        explanation: "192 = 3 × 2^n -> 2^n = 64 -> n = 6 (tahap-6)."
      },
      {
        question: "Setiap bulan jumlah ikan menjadi 2 kali lipat. Setelah 5 bulan jumlahnya 320 ekor. Berapakah jumlah ikan pada awal pengamatan?",
        options: ["5 ekor", "10 ekor", "15 ekor", "20 ekor"],
        correctAnswer: 1,
        explanation: "U = a × 2^5 -> 320 = a × 32 -> a = 320 / 32 = 10 ekor."
      }
    ]
  },
  {
    id: 'soal-5-6-7-geometri',
    title: '4. Soal 5, 6 & 7: Menentukan Rasio & Suku Geometri',
    icon: 'Lightbulb',
    content: `
# Pembahasan Menentukan Rasio & Suku Barisan Geometri

---

### Soal 5. Menentukan Rasio Geometri
> *"Seorang peserta didik mengamati pertumbuhan tanaman di halaman sekolah. Pada awal pengamatan terdapat 3 tanaman. Setelah mengalami pertumbuhan selama 3 tahap, jumlah tanaman menjadi 81. Jika pertumbuhan mengikuti pola bilangan geometri, berapakah rasio (r) pertumbuhan tanaman tersebut?"*

#### Pilihan Jawaban:
* **a)** 2
* **b)** 3
* **c)** 4
* **d)** 5

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Seorang peserta didik mengamati pertumbuhan tanaman..."* → Pengantar.
2. 🔹 **Kalimat 2:** *"Pada awal pengamatan terdapat 3 tanaman."* → **Suku Awal (a): a = 3**.
3. 🔹 **Kalimat 3:** *"Setelah mengalami pertumbuhan selama 3 tahap, jumlah tanaman menjadi 81."*
   * 👉 **Banyak Tahap (n): n = 3**.
   * 👉 **Nilai Akhir (U): U = 81**.
4. 🔹 **Kalimat 4:** *"Jika pertumbuhan mengikuti pola bilangan geometri, berapakah rasio (r) pertumbuhan tanaman tersebut?"*
   * 👉 **Variabel yang Dicari:** Rasio (**r**).

#### Langkah Penyelesaian:
> **U = a × rⁿ**  
> **81 = 3 × r³**  
> **r³ = 81 / 3 = 27**  
> **r = ∛27 = 3**

* **Kunci Jawaban:** **b) 3**
* **Penjelasan:** Tanaman berlipat dengan rasio r = 3 (3 × 3³ = 3 × 27 = 81).

---

### Soal 6. Menentukan Rasio dari Suku Pertama dan Ketiga
> *"Diketahui pola bilangan: 2, ..., 32. Jika suku pertama adalah 2 dan suku ketiga adalah 32, berapakah rasio (r) barisan tersebut?"*

#### Pilihan Jawaban:
* **a)** 4
* **b)** 5
* **c)** 6
* **d)** 7

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
* 🔹 *"suku pertama adalah 2"* → **a = U₁ = 2**.
* 🔹 *"suku ketiga adalah 32"* → **U₃ = 32** (dengan n = 3).
* 🔹 *"berapakah rasio (r) barisan tersebut?"* → Variabel yang dicari adalah **r**.

#### Langkah Penyelesaian:
> **Uₙ = a × rⁿ⁻¹**  
> **U₃ = 2 × r³⁻¹**  
> **32 = 2 × r²**  
> **r² = 32 / 2 = 16**  
> **r = √16 = 4**

* **Kunci Jawaban:** **a) 4**
* **Penjelasan:** Dari U₁ ke U₃ dikalikan r². 2 × 4² = 2 × 16 = 32, sehingga rasionya adalah 4.

---

### Soal 7. Menentukan Suku ke-7 Geometri
> *"Diketahui pola bilangan berikut: 3, 6, 12, 24, ... Berapakah nilai suku ke-7 dari barisan tersebut?"*

#### Pilihan Jawaban:
* **a)** 96
* **b)** 128
* **c)** 192
* **d)** 256

---

#### 🔍 Bedah Soal Menjadi Variabel Matematis:
* 🔹 Pola: **3, 6, 12, 24, ...**
  * Suku pertama (**a**) = **3**
  * Rasio (**r**) = 6 / 3 = 12 / 6 = **2**
* 🔹 *"Berapakah nilai suku ke-7..."* → **n = 7**, dicari **U₇**.

#### Langkah Penyelesaian:
> **Uₙ = a × rⁿ⁻¹**  
> **U₇ = 3 × 2⁷⁻¹**  
> **U₇ = 3 × 2⁶**  
> **U₇ = 3 × 64 = 192**

* **Kunci Jawaban:** **c) 192**
* **Penjelasan:** Pangkat rumus suku ke-n geometri adalah n - 1 (7 - 1 = 6). Jadi U₇ = 3 × 64 = 192.
    `,
    quiz: [
      {
        question: "Pada awal terdapat 3 tanaman, setelah 3 tahap menjadi 81. Jika mengikuti pola geometri, berapakah rasio (r) pertumbuhannya?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        explanation: "81 = 3 × r^3 -> r^3 = 27 -> r = 3."
      },
      {
        question: "Diketahui pola bilangan: 2, ..., 32. Jika suku pertama adalah 2 dan suku ketiga adalah 32, berapakah rasio (r) barisan tersebut?",
        options: ["4", "5", "6", "7"],
        correctAnswer: 0,
        explanation: "U3 = a × r^2 -> 32 = 2 × r^2 -> r^2 = 16 -> r = 4."
      },
      {
        question: "Diketahui pola bilangan: 3, 6, 12, 24, ... Berapakah nilai suku ke-7 dari barisan tersebut?",
        options: ["96", "128", "192", "256"],
        correctAnswer: 2,
        explanation: "a = 3, r = 2. U7 = 3 × 2^(7-1) = 3 × 2^6 = 3 × 64 = 192."
      }
    ]
  },
  {
    id: 'soal-8-9-validasi',
    title: '5. Soal 8 & 9: Analisis & Validasi Rumus Barisan',
    icon: 'ShieldCheck',
    content: `
# Pembahasan Validasi & Pemilihan Rumus Pola Bilangan

---

### Soal 8. Menguji Pemakaian Rumus Geometri
> *Diketahui rumus:*  
> **Uₙ = a × rⁿ⁻¹**  
> *Rumus tersebut bisa dipakai dalam soal berikut:*  
> *Perhatikan pola berikut: **4, 8, 16, 32, ...***  
> *Tentukan nilai dari suku ke-9?*  
> *Pernyataan di atas adalah ....*

#### Pilihan Jawaban:
* **a)** BENAR
* **b)** SALAH

---

#### 🔍 Analisis Matematis:
1. 🔹 Rumus yang diberikan: **Uₙ = a × rⁿ⁻¹** adalah rumus suku ke-n untuk **Barisan Geometri**.
2. 🔹 Cek pola barisan: **4, 8, 16, 32, ...**
   * 8 / 4 = 2
   * 16 / 8 = 2
   * 32 / 16 = 2
   * Pola memiliki perbandingan atau rasio tetap (r = 2), sehingga terbukti merupakan **Barisan Geometri**.
3. 🔹 Nilai suku ke-9:
   * U₉ = 4 × 2⁹⁻¹ = 4 × 2⁸ = 4 × 256 = 1.024.

* **Kunci Jawaban:** **a) BENAR**
* **Penjelasan:** Barisan 4, 8, 16, 32 memiliki rasio perkalian tetap (r = 2), sehingga rumus Uₙ = a × rⁿ⁻¹ sangat tepat dipakai.

---

### Soal 9. Menguji Kesesuaian Rumus pada Barisan Aritmetika
> *Diketahui rumus:*  
> **Uₙ = a × rⁿ⁻¹**  
> *Rumus tersebut bisa dipakai dalam soal berikut:*  
> *Perhatikan pola berikut: **5, 9, 13, 17, ...***  
> *Tentukan nilai dari suku ke-10!*  
> *Pernyataan di atas adalah ....*

#### Pilihan Jawaban:
* **a)** BENAR
* **b)** SALAH

---

#### 🔍 Analisis Matematis:
1. 🔹 Rumus yang tertulis: **Uₙ = a × rⁿ⁻¹** adalah rumus barisan **Geometri**.
2. 🔹 Cek pola barisan: **5, 9, 13, 17, ...**
   * 9 - 5 = 4
   * 13 - 9 = 4
   * 17 - 13 = 4
   * Barisan bertambah dengan selisih/beda tetap (b = 4), artinya ini adalah **Barisan Aritmetika**, BUKAN geometri!
3. 🔹 Rumus yang benar untuk barisan ini seharusnya adalah rumus aritmetika:
   * Uₙ = a + (n - 1)b
   * U₁₀ = 5 + (10 - 1) × 4 = 5 + 36 = 41.

* **Kunci Jawaban:** **b) SALAH**
* **Penjelasan:** Pola 5, 9, 13, 17 adalah barisan aritmetika karena memiliki beda tetap (+4). Rumus geometri Uₙ = a × rⁿ⁻¹ tidak dapat dipakai untuk barisan ini.
    `,
    quiz: [
      {
        question: "Uₙ = a × rⁿ⁻¹ | Rumus tersebut bisa dipakai dalam soal: 'Perhatikan pola 4, 8, 16, 32, ... Tentukan nilai suku ke-9'. Pernyataan ini adalah:",
        options: ["BENAR", "SALAH"],
        correctAnswer: 0,
        explanation: "BENAR. Barisan 4, 8, 16, 32 memiliki rasio tetap (r = 2), sehingga merupakan barisan geometri dan tepat memakai rumus Un = a × r^(n-1)."
      },
      {
        question: "Uₙ = a × rⁿ⁻¹ | Rumus tersebut bisa dipakai dalam soal: 'Perhatikan pola 5, 9, 13, 17, ... Tentukan nilai suku ke-10'. Pernyataan ini adalah:",
        options: ["BENAR", "SALAH"],
        correctAnswer: 1,
        explanation: "SALAH. Barisan 5, 9, 13, 17 bertambah 4 secara tetap, sehingga merupakan barisan aritmetika. Rumus yang tepat adalah Un = a + (n-1)b."
      }
    ]
  },
  {
    id: 'soal-10-11-aritmetika',
    title: '6. Soal 10 & 11: Soal Cerita Barisan Aritmetika',
    icon: 'Code',
    content: `
# Pembahasan Soal Cerita Barisan Aritmetika

---

### Soal 10. Pola Menabung
> *"Andi mulai menabung di celengan sebesar Rp5.000 pada minggu pertama. Setiap minggu berikutnya, Andi menambah jumlah tabungannya sebesar Rp2.000 dari jumlah tabungan minggu sebelumnya. Jika pola menabung tersebut berlangsung secara teratur, berapakah jumlah uang yang ditabung Andi pada minggu ke-10?"*

![Infografis Pola Menabung Andi yang Bertambah Tetap Setiap Minggu](/src/assets/images/tabungan_aritmetika_step_1794221597240.jpg)

#### Pilihan Jawaban:
* **a)** Rp21.000
* **b)** Rp23.000
* **c)** Rp25.000
* **d)** Rp27.000

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Andi mulai menabung di celengan sebesar Rp5.000 pada minggu pertama."*
   * 👉 **Variabel Suku Pertama (a):** **a = 5.000** *(tabungan minggu ke-1)*.
2. 🔹 **Kalimat 2:** *"Setiap minggu berikutnya, Andi menambah jumlah tabungannya sebesar Rp2.000 dari jumlah tabungan minggu sebelumnya."*
   * 👉 Kata kunci *"menambah tetap"* → Pola **Barisan Aritmetika**.
   * 👉 **Variabel Beda (b):** **b = 2.000**.
3. 🔹 **Kalimat 3:** *"Jika pola menabung tersebut berlangsung secara teratur, berapakah jumlah uang yang ditabung Andi pada minggu ke-10?"*
   * 👉 **Variabel Urutan Minggu (n):** **n = 10**.
   * 👉 **Variabel yang Dicari:** Nilai suku ke-10 (**U₁₀**).

#### Langkah Penyelesaian:
> **Uₙ = a + (n - 1) × b**  
> **U₁₀ = 5.000 + (10 - 1) × 2.000**  
> **U₁₀ = 5.000 + 9 × 2.000**  
> **U₁₀ = 5.000 + 18.000 = Rp23.000**

* **Kunci Jawaban:** **b) Rp23.000**
* **Penjelasan:** Penambahan Rp2.000 terjadi sebanyak 10 - 1 = 9 kali dari tabungan awal, sehingga pada minggu ke-10 Andi menabung sebesar Rp23.000.

---

### Soal 11. Susunan Kursi Gedung Pertunjukan
> *"Sebuah gedung pertunjukan memiliki susunan kursi yang membentuk pola barisan aritmetika. Baris pertama terdiri atas 12 kursi, baris kedua 16 kursi, dan baris ketiga 20 kursi. Jika pola tersebut berlanjut secara teratur, berapakah jumlah kursi pada baris ke-15?"*

#### Pilihan Jawaban:
* **a)** 64 kursi
* **b)** 68 kursi
* **c)** 72 kursi
* **d)** 76 kursi

---

#### 🔍 Bedah Kalimat Soal Menjadi Variabel Matematis:
1. 🔹 **Kalimat 1:** *"Sebuah gedung pertunjukan memiliki susunan kursi yang membentuk pola barisan aritmetika."*
   * 👉 Jenis barisan dipastikan: **Barisan Aritmetika**.
2. 🔹 **Kalimat 2:** *"Baris pertama terdiri atas 12 kursi, baris kedua 16 kursi, dan baris ketiga 20 kursi."*
   * 👉 **Variabel Suku Pertama (a):** **a = 12 kursi** *(baris ke-1)*.
   * 👉 **Variabel Beda (b):** b = 16 - 12 = 20 - 16 = **4 kursi**.
3. 🔹 **Kalimat 3:** *"Jika pola tersebut berlanjut secara teratur, berapakah jumlah kursi pada baris ke-15?"*
   * 👉 **Variabel Nomor Baris (n):** **n = 15**.
   * 👉 **Variabel yang Dicari:** Banyaknya kursi baris ke-15 (**U₁₅**).

#### Langkah Penyelesaian:
> **Uₙ = a + (n - 1) × b**  
> **U₁₅ = 12 + (15 - 1) × 4**  
> **U₁₅ = 12 + 14 × 4**  
> **U₁₅ = 12 + 56 = 68 kursi**

* **Kunci Jawaban:** **b) 68 kursi**
* **Penjelasan:** Setiap baris bertambah 4 kursi. Pada baris ke-15 terdapat 12 + (14 × 4) = 68 kursi.
    `,
    quiz: [
      {
        question: "Andi menabung Rp5.000 pada minggu pertama dan menambah Rp2.000 setiap minggu berikutnya. Berapakah jumlah uang yang ditabung Andi pada minggu ke-10?",
        options: ["Rp21.000", "Rp23.000", "Rp25.000", "Rp27.000"],
        correctAnswer: 1,
        explanation: "U10 = 5.000 + (10 - 1) × 2.000 = 5.000 + 18.000 = Rp23.000."
      },
      {
        question: "Baris pertama terdiri atas 12 kursi, baris kedua 16 kursi, dan baris ketiga 20 kursi. Berapakah jumlah kursi pada baris ke-15?",
        options: ["64 kursi", "68 kursi", "72 kursi", "76 kursi"],
        correctAnswer: 1,
        explanation: "a = 12, b = 4. U15 = 12 + (15 - 1) × 4 = 12 + 56 = 68 kursi."
      }
    ]
  },
  {
    id: 'soal-12-15-aritmetika',
    title: '7. Soal 12 s.d. 15: Suku & Beda Barisan Aritmetika',
    icon: 'Layers',
    content: `
# Pembahasan Suku & Beda Barisan Aritmetika

---

### Soal 12. Menentukan Suku ke-15
> *"Diketahui pola bilangan: 7, 12, 17, 22, ... Berapakah nilai suku ke-15?"*

#### Pilihan Jawaban:
* **a)** 72
* **b)** 77
* **c)** 27
* **d)** 64

---

#### 🔍 Bedah Soal:
* 🔹 Pola: **7, 12, 17, 22, ...**
  * Suku pertama (**a**) = **7**
  * Beda (**b**) = 12 - 7 = 17 - 12 = **5**
* 🔹 Ditanyakan suku ke-15 (n = 15) → **U₁₅**.

#### Langkah Penyelesaian:
> **Uₙ = a + (n - 1) × b**  
> **U₁₅ = 7 + (15 - 1) × 5**  
> **U₁₅ = 7 + 14 × 5**  
> **U₁₅ = 7 + 70 = 77**

* **Kunci Jawaban:** **b) 77**
* **Penjelasan:** Setiap suku bertambah 5. Penambahan terjadi 14 kali dari suku pertama: 7 + 70 = 77.

---

### Soal 13. Menentukan Beda (b)
> *"Diketahui pola bilangan: 4, 9, 14, 19, ... Berapakah selisih (b) dari barisan tersebut?"*

#### Pilihan Jawaban:
* **a)** 5
* **b)** 6
* **c)** 3
* **d)** 4

---

#### 🔍 Bedah Soal:
* 🔹 Beda (**b**) adalah selisih antara suku sesudah dikurangi suku sebelumnya (b = Uₙ - Uₙ₋₁).
* 🔹 b = U₂ - U₁ = 9 - 4 = **5**.
* 🔹 b = U₃ - U₂ = 14 - 9 = **5**.

* **Kunci Jawaban:** **a) 5**
* **Penjelasan:** Setiap suku bertambah 5 secara konstan, sehingga bedanya b = 5.

---

### Soal 14. Menentukan Suku Pertama (a)
> *"Diketahui barisan aritmetika memiliki suku ke-8 sebesar 38 dan beda sebesar 4. Berapakah suku pertamanya?"*

#### Pilihan Jawaban:
* **a)** 6
* **b)** 8
* **c)** 10
* **d)** 12

---

#### 🔍 Bedah Soal Menjadi Variabel Matematis:
* 🔹 Suku ke-8 (U₈) = **38** (dengan n = 8)
* 🔹 Beda (**b**) = **4**
* 🔹 Dicari: Suku pertama (**a**)

#### Langkah Penyelesaian:
> **Uₙ = a + (n - 1) × b**  
> **U₈ = a + (8 - 1) × 4**  
> **38 = a + 7 × 4**  
> **38 = a + 28**  
> **a = 38 - 28 = 10**

* **Kunci Jawaban:** **c) 10**
* **Penjelasan:** Untuk mencari suku pertama, nilai U₈ dikurangi akumulasi 7 kali beda (38 - 28 = 10).

---

### Soal 15. Menentukan Suku ke-20
> *"Diketahui pola bilangan berikut: 2, 4, 6, 8, ... Berapakah nilai dari suku ke-20?"*

#### Pilihan Jawaban:
* **a)** 40
* **b)** 38
* **c)** 42
* **d)** 36

---

#### 🔍 Bedah Soal:
* 🔹 Pola: **2, 4, 6, 8, ...**
  * Suku pertama (**a**) = **2**
  * Beda (**b**) = 4 - 2 = **2**
* 🔹 Ditanyakan suku ke-20 (n = 20) → **U₂₀**.

#### Langkah Penyelesaian:
> **Uₙ = a + (n - 1) × b**  
> **U₂₀ = 2 + (20 - 1) × 2**  
> **U₂₀ = 2 + 19 × 2**  
> **U₂₀ = 2 + 38 = 40**

* **Kunci Jawaban:** **a) 40**
* **Penjelasan:** Pola bilangan genap positif ke-20 adalah 2 × 20 = 40, atau dihitung dengan 2 + (19 × 2) = 40.
    `,
    quiz: [
      {
        question: "Diketahui pola bilangan: 7, 12, 17, 22, ... Berapakah nilai suku ke-15?",
        options: ["72", "77", "27", "64"],
        correctAnswer: 1,
        explanation: "U15 = 7 + (15 - 1) × 5 = 7 + 70 = 77."
      },
      {
        question: "Diketahui pola bilangan: 4, 9, 14, 19, ... Berapakah selisih (b) dari barisan tersebut?",
        options: ["5", "6", "3", "4"],
        correctAnswer: 0,
        explanation: "b = 9 - 4 = 5."
      },
      {
        question: "Diketahui barisan aritmetika memiliki suku ke-8 sebesar 38 dan beda 4. Berapakah suku pertamanya?",
        options: ["6", "8", "10", "12"],
        correctAnswer: 2,
        explanation: "38 = a + 7 × 4 -> a = 38 - 28 = 10."
      },
      {
        question: "Diketahui pola bilangan berikut: 2, 4, 6, 8, ... Berapakah nilai dari suku ke-20?",
        options: ["40", "38", "42", "36"],
        correctAnswer: 0,
        explanation: "U20 = 2 + 19 × 2 = 2 + 38 = 40."
      }
    ]
  }
];
