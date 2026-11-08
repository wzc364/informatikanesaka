/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic } from './types';

export const PHP_DASAR_TOPICS: Topic[] = [
  {
    id: 'pengertian',
    title: 'Pengertian PHP',
    icon: 'Info',
    content: `
# Pengertian PHP (Panduan Lengkap)

PHP adalah kependekan dari **Hypertext Preprocessor**. Ia merupakan bahasa pemrograman *open-source* yang sangat populer dan sangat cocok untuk pengembangan web, karena dapat disisipkan langsung ke dalam HTML.

### 1. Sejarah Singkat & Popularitas
Diciptakan pertama kali oleh **Rasmus Lerdorf** pada tahun 1994. Awalnya PHP digunakan untuk melacak pengunjung ke CV online miliknya. Kini, PHP telah berkembang pesat dan digunakan oleh jutaan website di seluruh dunia, termasuk raksasa teknologi seperti **Facebook, Wikipedia, dan WordPress**.

### 2. Cara Kerja PHP (Server-Side)
PHP adalah bahasa pemrograman **Server-Side**, artinya semua kode PHP diproses di server web sebelum dikirim ke browser pengguna. 
*   **Request**: Pengguna meminta halaman (.php).
*   **Processing**: Server membaca tag PHP, menjalankan logikanya, lalu menghasilkan HTML.
*   **Response**: Server mengirimkan HTML murni ke browser. Pengguna tidak akan pernah melihat kode asli PHP Anda (aman!).

### 3. Mengapa Masih Menggunakan PHP?
1.  **Mudah Dipelajari**: Sintaksnya intuitif bagi pemula.
2.  **Dukungan Komunitas**: Dokumentasi melimpah dan forum bantuan ada di mana-mana.
3.  **Kecepatan**: Versi terbaru (PHP 8+) jauh lebih cepat dan efisien.
4.  **Ekosistem Matang**: Memiliki framework hebat seperti PHP Laravel untuk skala besar.

> PHP bukan hanya bahasa pemrograman, ia adalah fondasi dari 78% website di internet saat ini.
    `,
    quiz: [
      {
        question: "Apa kepanjangan dari PHP?",
        options: ["Private Home Page", "Personal Hypertext Processor", "Hypertext Preprocessor", "Preprocessor Home Page"],
        correctAnswer: 2,
        explanation: "PHP awalnya singkatan dari Personal Home Page, namun sekarang menjadi singkatan rekursif dari Hypertext Preprocessor."
      },
      {
        question: "Di mana kode PHP diproses?",
        options: ["Di browser pengguna", "Di server web", "Di database saja", "Di komputer lokal tanpa server"],
        correctAnswer: 1,
        explanation: "PHP adalah bahasa pemrograman server-side, artinya kode diproses di server sebelum hasilnya dikirim ke browser."
      }
    ]
  },
  {
    id: 'fungsi',
    title: 'Fungsi PHP',
    icon: 'Settings',
    content: `
# Apa Yang Bisa Dilakukan PHP?

PHP adalah bahasa serba bisa dalam dunia pengembangan web. Hampir semua fitur interaktif yang Anda lihat di internet bisa dibuat dengan PHP.

### 1. Mengolah Konten Dinamis
Berbeda dengan HTML yang bersifat statis (tetap), PHP memungkinkan konten halaman berganti-ganti sesuai waktu, profil user, atau input tertentu. Misalnya, menampilkan ucapan "Selamat Pagi, [Nama Anda]".

### 2. Manajemen Database (CRUD)
PHP bekerja sangat harmonis dengan database seperti **MySQL**.
1.  **Create**: Menambah data (misal: pendaftaran user).
2.  **Read**: Membaca data (misal: menampilkan daftar artikel).
3.  **Update**: Mengubah data (misal: edit profil).
4.  **Delete**: Menghapus data (misal: hapus postingan).

### 3. Keamanan & Autentikasi
Dengan PHP, Anda bisa membuat sistem Login, Register, dan membatasi akses halaman tertentu hanya untuk admin. PHP menyediakan fungsi enkripsi data yang kuat untuk melindungi password user.

### 4. Pengiriman & Penerimaan Cookie/Session
PHP digunakan untuk mengingat user yang sudah login menggunakan **Session**, sehingga user tidak perlu login ulang setiap kali pindah halaman.

### 5. Manipulasi File & Gambar
PHP bisa membuat, membaca, menulis, dan menutup file di server. Bahkan PHP bisa memproses gambar secara otomatis (resize, watermark, dll).
    `,
    quiz: [
      {
        question: "Manakah yang BUKAN merupakan fungsi utama PHP?",
        options: ["Menghubungkan ke database", "Membuat animasi 3D di browser", "Membuat sistem login", "Mengelola input form"],
        correctAnswer: 1,
        explanation: "Animasi 3D di browser biasanya ditangani oleh JavaScript (client-side), sedangkan PHP fokus pada logika server-side."
      },
      {
        question: "Apa kependekan dari manajemen data Dasar di database?",
        options: ["READ", "CRUD", "EDIT", "SAVE"],
        correctAnswer: 1,
        explanation: "CRUD adalah standar industri: Create, Read, Update, Delete."
      }
    ]
  },
  {
    id: 'penulisan',
    title: 'Penulisan Dasar',
    icon: 'Code',
    content: `
# Aturan Penulisan (Sintaks)

Memahami dasar penulisan sangat penting untuk menghindari error. PHP memiliki aturan yang cukup disiplin namun konsisten.

### 1. Tag Pembuka & Penutup
Semua kode PHP harus berada di dalam tag khusus:
\`\`\`php
<?php
  // Kode Anda di sini
?>
\`\`\`
*Tip: Jika file hanya berisi kode PHP saja, tag penutup \`?>\` biasanya tidak diwajibkan (dan justru disarankan dihapus untuk menghindari spasi tak sengaja).*

### 2. Perintah Output: Echo vs Print
Ada dua cara utama menampilkan teks:
1.  **echo**: Paling populer, sedikit lebih cepat, tidak mengembalikan nilai.
2.  **print**: Hampir sama, tapi mengembalikan nilai 1 (bisa digunakan dalam ekspresi).

\`\`\`php
<?php
echo "Halo Dunia!"; // Cara umum
print "Belajar PHP Seru"; // Cara alternatif
?>
\`\`\`

### 3. Pentingnya Titik Koma (;)
Setiap akhir baris perintah di PHP **WAJIB** diakhiri dengan titik koma. Tanpa ini, kode Anda akan mengalami *Parse Error*.

### 4. Komentar (Catatan Kode)
Gunakan komentar agar kode Anda mudah dibaca oleh orang lain atau diri Anda sendiri di masa depan:
*   \`//\` : Untuk komentar satu baris.
*   \`#\` : Cara lain untuk komentar satu baris.
*   \`/* ... */\` : Untuk komentar banyak baris (blok).
    `,
    quiz: [
      {
        question: "Tag pembuka PHP yang benar adalah?",
        options: ["<script>", "<?php", "<php", "<?"],
        correctAnswer: 1,
        explanation: "Tag standar pembuka PHP adalah <?php."
      },
      {
        question: "Setiap baris kode PHP wajib diakhiri dengan?",
        options: ["Titik (.)", "Koma (,)", "Titik Koma (;)", "Persen (%)"],
        correctAnswer: 2,
        explanation: "Semicolon (;) adalah pemisah antar instruksi di PHP."
      }
    ]
  },
  {
    id: 'variabel',
    title: 'Variabel',
    icon: 'Variable',
    content: `
# Memahami Variabel

Variabel adalah "wadah" untuk menyimpan informasi. Di PHP, variabel bersifat sangat fleksibel karena Anda tidak perlu menentukan tipe datanya secara manual.

### 1. Aturan Penulisan Variabel
Variabel PHP memiliki aturan ketat:
1.  Harus dimulai dengan simbol **$** (dollar).
2.  Nama harus dimulai dengan huruf atau garis bawah (_).
3.  **Tidak boleh** dimulai dengan angka.
4.  Hanya berisi karakter alfa-numerik dan garis bawah (a-z, 0-9, _).
5.  **Bersifat Case-sensitive**: \`$nama\` dan \`$NAMA\` adalah dua variabel yang berbeda.

### 2. Contoh Penggunaan
\`\`\`php
<?php
$produk = "Sepatu Lari";
$harga = 550000;
$stok = 12;

echo "Item: " . $produk;
echo "Harga: " . $harga;
?>
\`\`\`

### 3. Gabung Teks (Konkatenasi)
Di PHP, kita menggunakan tanda **titik (.)** untuk menggabungkan dua teks atau variabel.
\`\`\`php
$nama = "Ega";
echo "Selamat belajar, " . $nama . "!";
// Hasil: Selamat belajar, Ega!
\`\`\`

### 4. Skop Variabel
Variabel bisa bersifat **Lokal** (hanya di dalam fungsi) atau **Global** (bisa diakses di mana saja). Namun, secara default, variabel di luar fungsi tidak bisa langsung diakses di dalam fungsi tanpa kata kunci khusus.
    `,
    quiz: [
      {
        question: "Karakter apa yang wajib digunakan untuk memulai variabel di PHP?",
        options: ["&", "#", "$", "@"],
        correctAnswer: 2,
        explanation: "Semua variabel di PHP harus dimulai dengan simbol dollar ($)."
      },
      {
        question: "Manakah penulisan variabel yang SALAH?",
        options: ["$nama_saya", "$_umur", "$1nilai", "$Nilai"],
        correctAnswer: 2,
        explanation: "Variabel tidak boleh diawali dengan angka (misal: $1nilai)."
      }
    ]
  },
  {
    id: 'tipe-data',
    title: 'Tipe Data',
    icon: 'Database',
    content: `
# Berbagai Tipe Data

PHP secara otomatis mengenali tipe data berdasarkan nilai yang Anda berikan. Berikut adalah tipe data yang paling sering digunakan:

### 1. String (Teks)
Kumpulan karakter. Bisa menggunakan kutip tunggal ('') atau kutip ganda ("").
*Kutip ganda bisa memproses variabel di dalamnya, kutip tunggal tidak.*

### 2. Integer (Angka Bulat)
Angka tanpa desimal, bisa positif atau negatif.
\`\`\`php
$x = 5985;
\`\`\`

### 3. Float/Double (Desimal)
Angka dengan titik desimal atau angka dalam bentuk eksponensial.
\`\`\`php
$pi = 3.14;
\`\`\`

### 4. Boolean (Logika)
Hanya memiliki dua kemungkinan nilai: **true** (benar) atau **false** (salah). Sangat penting untuk pengujian kondisi.

### 5. Array (Kumpulan Data)
Variabel yang bisa menyimpan banyak nilai sekaligus.
\`\`\`php
$cars = array("Volvo", "BMW", "Toyota");
// Cara baru:
$cars = ["Volvo", "BMW", "Toyota"];
\`\`\`

### 6. NULL
Tipe data khusus yang menandakan variabel tidak memiliki nilai.

### 7. Cek Tipe Data
Gunakan fungsi \`var_dump()\` untuk melihat isi variabel sekaligus tipe datanya. Berguna sekali untuk debugging!
    `,
    quiz: [
      {
        question: "Tipe data apa yang digunakan untuk menyimpan nilai desimal seperti 3.14?",
        options: ["Integer", "String", "Float", "Boolean"],
        correctAnswer: 2,
        explanation: "Float digunakan untuk menyimpan angka pecahan atau desimal."
      },
      {
        question: "Fungsi apa yang digunakan untuk melihat isi dan tipe data variabel secara mendalam?",
        options: ["echo()", "print()", "var_dump()", "type_info()"],
        correctAnswer: 2,
        explanation: "var_dump() adalah senjata utama developer PHP untuk memeriksa variabel."
      }
    ]
  },
  {
    id: 'operator',
    title: 'Operator PHP',
    icon: 'PlusMinus',
    content: `
# Operator PHP

Operator digunakan untuk melakukan operasi pada variabel dan nilai.

### 1. Operator Aritmatika (Matematika)
1.  \`+\` : Penjumlahan
2.  \`-\` : Pengurangan
3.  \`*\` : Perkalian
4.  \`/\` : Pembagian
5.  \`%\` : Modulo (Sisa Bagi)
6.  \`**\` : Perpangkatan (PHP 5.6+)

### 2. Operator Penugasan (Assignment)
Digunakan untuk memberikan nilai ke variabel.
*   \`$x = 10\` : Memberikan nilai 10.
*   \`$x += 5\` : Sama dengan \`$x = $x + 5\`.

### 3. Operator Perbandingan
Digunakan untuk membandingkan dua nilai. Hasilnya selalu boolean (true/false).
*   \`==\` : Sama nilai.
*   \`===\` : Identik (Sama nilai DAN sama tipe data).
*   \`!=\` : Tidak sama nilai.
*   \`>\` : Lebih besar.
*   \`<\` : Lebih kecil.

### 4. Increment & Decrement
Cara cepat menambah atau mengurangi nilai sebesar 1.
*   \`$x++\` : Tambah 1 setelah baris ini diproses.
*   \`++$x\` : Tambah 1 sebelum baris ini diproses.
    `,
    quiz: [
      {
        question: "Apa hasil dari echo 10 % 3;?",
        options: ["3", "1", "0", "10"],
        correctAnswer: 1,
        explanation: "% adalah operator modulo (sisa bagi). 10 dibagi 3 sisa 1."
      },
      {
        question: "Apa perbedaan antara == dan === di PHP?",
        options: ["Tidak ada perbedaan", "== hanya cek nilai, === cek nilai dan tipe data", "=== lebih cepat daripada ==", "== untuk angka, === untuk teks"],
        correctAnswer: 1,
        explanation: "Operator identitas (===) lebih ketat karena juga memeriksa tipe data variabel."
      }
    ]
  },
  {
    id: 'percabangan',
    title: 'Percabangan (If)',
    icon: 'GitBranch',
    content: `
# Mengambil Keputusan (Control Flow)

Program PHP Anda bisa "berpikir" dan mengambil jalan berbeda berdasarkan data yang ada.

### 1. Struktur If
Blok kode hanya dijalankan jika kondisi benar.
\`\`\`php
if ($hari == "Minggu") {
    echo "Waktunya Libur!";
}
\`\`\`

### 2. Struktur If...Else
Menyediakan jalan alternatif jika kondisi pertama tidak terpenuhi.
\`\`\`php
if ($skor >= 70) {
    echo "Lulus";
} else {
    echo "Remedi";
}
\`\`\`

### 3. Struktur If...Elseif...Else
Digunakan untuk banyak kemungkinan kondisi.
\`\`\`php
if ($suhu > 30) {
    echo "Panas Sekali";
} elseif ($suhu > 20) {
    echo "Hangat";
} else {
    echo "Dingin";
}
\`\`\`

### 4. Switch Statement
Cara lebih rapi jika Anda punya banyak perbandingan untuk **satu variabel**.
\`\`\`php
switch ($warna) {
    case "merah":
        echo "Berhenti";
        break;
    case "kuning":
        echo "Siap-siap";
        break;
    case "hijau":
        echo "Jalan";
        break;
}
\`\`\`

### 5. Operator Logika dalam Kondisi
*   \`&&\` (AND): Kedua kondisi harus benar.
*   \`||\` (OR): Salah satu kondisi sudah cukup.
    `,
    quiz: [
      {
        question: "Manakah operator logika AND di PHP?",
        options: ["||", "&&", "!", "=="],
        correctAnswer: 1,
        explanation: "&& adalah operator logika DAN (AND) yang mengharuskan kedua kondisi benar."
      },
      {
        question: "Apa fungsi kata kunci 'break' di dalam struktur switch?",
        options: ["Menghentikan komputer", "Keluar dari program", "Menghentikan pengecekan case selanjutnya", "Memulai perulangan baru"],
        correctAnswer: 2,
        explanation: "Tanpa break, PHP akan terus menjalankan kode di bawahnya meskipun case-nya tidak cocok (fall-through)."
      }
    ]
  },
  {
    id: 'perulangan',
    title: 'Perulangan',
    icon: 'Repeat',
    content: `
# Mengulang Tugas (Loops)

Programming sangat berguna untuk melakukan hal yang sama berkali-kali tanpa lelah.

### 1. Perulangan For
Terbaik jika Anda sudah tahu pasti berapa kali ingin mengulang (misal 10 kali).
\`\`\`php
for ($i = 0; $i < 10; $i++) {
    echo "Putaran ke: " . $i;
}
\`\`\`

### 2. Perulangan While
Akan terus berjalan selama kondisi masih benar (hati-hati bisa terjadi *infinite loop*).
\`\`\`php
$x = 1;
while($x <= 5) {
    echo "Angka: $x <br>";
    $x++; // Ingat tambah ini agar berhenti!
}
\`\`\`

### 3. Perulangan Foreach
Sangat powerful untuk mengambil semua data di dalam **Array**. Tidak perlu manual mencatat panjang array-nya.
\`\`\`php
$mahasiswa = ["Andi", "Budi", "Caca"];
foreach ($mahasiswa as $nama) {
    echo "Nama: " . $nama . "<br>";
}
\`\`\`

### 4. Perbedaan While dan Do...While
*   **While**: Cek kondisi dulu, baru jalan.
*   **Do...While**: Jalan dulu minimal satu kali, baru cek kondisi.

### 5. Perintah Break & Continue
*   **Break**: Berhenti total sekarang juga.
*   **Continue**: Lewati putaran ini, lanjut ke putaran berikutnya.
    `,
    quiz: [
      {
        question: "Manakah perulangan yang khusus digunakan untuk Array?",
        options: ["for", "while", "do while", "foreach"],
        correctAnswer: 3,
        explanation: "foreach dirancang khusus untuk memproses setiap elemen dalam array dengan mudah."
      },
      {
        question: "Apa resiko jika tidak memberlakukan increment ($i++) di dalam perulangan while?",
        options: ["Error sintaks", "Komputer meledak", "Infinite loop (program tidak akan pernah berhenti)", "Program malah jadi lebih cepat"],
        correctAnswer: 2,
        explanation: "Jika kondisi selalu benar karena variabel tidak berubah, loop akan berjalan selamanya sampai memori habis."
      }
    ]
  },
  {
    id: 'input',
    title: 'Input (Form)',
    icon: 'Type',
    content: `
# Berinteraksi dengan User

Web yang bagus bukan cuma memberi info, tapi juga menerima input. PHP menangani data form dengan mudah.

### 1. Variabel Superglobal
PHP menyediakan variabel khusus yang selalu ada (global):
*   \`$_GET\`: Menangkap data dari URL (tidak aman untuk password, ada limit panjangnya).
*   \`$_POST\`: Menangkap data di latar belakang (aman untuk password, bisa kirim data besar).

### 2. Alur Pengiriman Data
1.  **Form HTML**: User mengisi data. Tag \`<form>\` harus punya atribut \`method\` dan \`action\`.
2.  **PHP Script**: Mengambil data tersebut lewat variabel \`$_POST['nama_input']\`.

### 3. Contoh Praktis
\`\`\`html
<!-- index.html -->
<form action="proses.php" method="POST">
  Email: <input type="email" name="user_email">
  <button type="submit">Kirim</button>
</form>
\`\`\`

\`\`\`php
<?php
// proses.php
$email = $_POST['user_email'];
echo "Terima kasih, email " . $email . " sudah terdata.";
?>
\`\`\`

### 4. Keamanan Input
**Jangan pernah percaya input user!** Gunakan fungsi seperti \`htmlspecialchars()\` untuk mencegah serangan XSS (skrip jahat yang disisipkan ke website Anda).
    `,
    quiz: [
      {
        question: "Variabel superglobal untuk mengambil data form dengan method POST adalah?",
        options: ["$POST", "$_POST", "POST()", "$_GET"],
        correctAnswer: 1,
        explanation: "PHP menggunakan $_POST (huruf besar) untuk mengambil data dari form bermetode POST."
      },
      {
        question: "Metode mana yang mengirim data melalui URL sehingga terlihat oleh pengguna?",
        options: ["SECURE", "PUT", "POST", "GET"],
        correctAnswer: 3,
        explanation: "GET mengirim data via query string di URL, sangat berguna untuk fitur search tapi kurang aman untuk data pribadi."
      }
    ]
  },
  {
    id: 'database',
    title: 'Koneksi Database',
    icon: 'ShieldCheck',
    content: `
# Menghubungkan ke Database

Website besar menggunakan database untuk menyimpan jutaan data user dan postingan.

### 1. Apa itu MySQL?
MySQL adalah Database Management System (DBMS) yang paling umum digunakan bersama PHP. Kombinasi ini sering disebut **LAMP** (Linux, Apache, MySQL, PHP).

### 2. Menggunakan MySQLi
PHP memiliki *extension* bawaan bernama **MySQLi** (MySQL Improved).

**Langkah Koneksi:**
1.  **Servername**: Biasanya \`localhost\`.
2.  **Username**: Misal \`root\`.
3.  **Password**: Password database Anda.
4.  **Database Name**: Nama database yang ingin dikelola.

\`\`\`php
<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "sekolah_db";

$conn = mysqli_connect($host, $user, $pass, $db);

// Cek apakah sukses
if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
echo "Koneksi Berhasil!";
?>
\`\`\`

### 3. Menutup Koneksi
Selalu biasakan menutup koneksi ke database setelah selesai digunakan untuk menghemat sumber daya server:
\`\`\`php
mysqli_close($conn);
\`\`\`

### 4. Alternatif: PDO
Selain MySQLi, ada juga **PDO (PHP Data Objects)**. Keunggulannya adalah Anda bisa dengan mudah pindah dari MySQL ke PostgreSQL atau database lain tanpa harus merombak banyak kode.
    `,
    quiz: [
      {
        question: "Fungsi bawaan PHP untuk menghubungkan ke database MySQL adalah?",
        options: ["mysql_open()", "connect_db()", "mysqli_connect()", "db_connect()"],
        correctAnswer: 2,
        explanation: "mysqli_connect() adalah fungsi standar untuk membuat koneksi ke MySQL di PHP modern."
      },
      {
        question: "Apa singkatan dari DBMS?",
        options: ["Database Master System", "Data Base Management System", "Data Build Maker System", "Digital Base Monitoring System"],
        correctAnswer: 1,
        explanation: "DBMS adalah Database Management System, perangkat lunak untuk mengelola database."
      }
    ]
  }
];

export const PHP_TOPICS: Topic[] = [
  {
    id: 'oop',
    title: 'Object-Oriented Programming (OOP) di PHP',
    icon: 'Code',
    content: `
# Object-Oriented Programming (OOP) di PHP

OOP adalah paradigma pemrograman yang berorientasi pada objek. Ini sangat penting ketika membangun aplikasi PHP yang besar dan kompleks.

### 1. Class & Object
- **Class**: Cetak biru (blueprint) atau template untuk membuat objek.
- **Object**: Instansiasi dari class.

\`\`\`php
class Mobil {
    public $merk;
    public $warna;

    public function klakson() {
        return "Beep beep!";
    }
}

$mobil_saya = new Mobil();
$mobil_saya->merk = "Toyota";
echo $mobil_saya->klakson();
\`\`\`

### 2. Properties & Methods
- **Properties**: Variabel yang ada di dalam class.
- **Methods**: Fungsi yang ada di dalam class.

### 3. Encapsulation (Access Modifiers)
- **public**: Bisa diakses dari mana saja.
- **protected**: Bisa diakses dari dalam class dan class turunannya.
- **private**: Hanya bisa diakses dari dalam class itu sendiri.
    `,
    quiz: [
      {
        question: "Apa itu paradigma pemrograman yang menggunakan class dan object?",
        options: ["Procedural Programming", "Object-Oriented Programming", "Functional Programming", "Logical Programming"],
        correctAnswer: 1,
        explanation: "Object-Oriented Programming (OOP) menggunakan objek dan class sebagai dasar pengkodeannya."
      },
      {
        question: "Access modifier mana yang hanya mengizinkan metode diakses dari dalam class itu sendiri?",
        options: ["public", "protected", "private", "static"],
        correctAnswer: 2,
        explanation: "private membatasi akses properti atau fungsi hanya di dalam class tempat ia didefinisikan."
      }
    ]
  },
  {
    id: 'mvc',
    title: 'Konsep MVC (Model-View-Controller)',
    icon: 'GitBranch',
    content: `
# MVC (Model-View-Controller)

MVC adalah pola arsitektur perangkat lunak yang memisahkan aplikasi menjadi tiga komponen utama. Ini adalah standar dalam framework PHP modern seperti Laravel, CodeIgniter, atau Symfony.

### 1. Model
Mengelola data dan logika bisnis. Model berinteraksi langsung dengan database (mengambil, menyimpan, memperbarui data).
*Aturan: Model tidak boleh langsung berinteraksi dengan tampilan (HTML).*

### 2. View
Mengatur presentasi atau tampilan antarmuka (UI). Berisi HTML, CSS, dan PHP minimal (hanya untuk menampilkan variabel).
*Aturan: View tidak boleh melakukan query ke database.*

### 3. Controller
Menjadi jembatan antara Model dan View. Controller menangani *request* dari user, meminta data ke Model, dan mengirimkannya ke View untuk ditampilkan.

\`\`\`php
// Contoh Pseudo-Controller
class UserController {
    public function showProfile($id) {
        $user = User::findById($id); // Model
        return view('profile', ['user' => $user]); // View
    }
}
\`\`\`
    `,
    quiz: [
      {
        question: "Bagian mana dalam MVC yang berinteraksi langsung dengan Database?",
        options: ["Model", "View", "Controller", "Router"],
        correctAnswer: 0,
        explanation: "Model bertanggung jawab untuk urusan manipulasi data ke dan dari database."
      },
      {
        question: "Apa tugas utama Controller?",
        options: ["Menyimpan desain warna tombol", "Menjadi penghubung antara Model dan View", "Menyimpan password ke database", "Menampilkan kode tag HTML langsung"],
        correctAnswer: 1,
        explanation: "Controller menerima request, memprosesnya dengan Model, dan mengirim hasilnya ke View."
      }
    ]
  }
];

export const HTML_DASAR_TOPICS: Topic[] = [
  {
    id: 'pengenalan-html',
    title: 'Pengenalan HTML',
    icon: 'Globe',
    content: `
# Pengenalan HTML

**HTML** (*HyperText Markup Language*) adalah bahasa markah standar yang digunakan untuk membuat struktur halaman web.

### Struktur Dasar HTML
Setiap halaman HTML memiliki struktur dasar seperti berikut:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Judul Halaman</title>
</head>
<body>
    <h1>Selamat Datang!</h1>
    <p>Ini adalah paragraf pertama saya.</p>
</body>
</html>
\`\`\`

- \`<!DOCTYPE html>\` mendefinisikan dokumen ini sebagai HTML5.
- \`<html>\` adalah elemen root.
- \`<head>\` berisi meta informasi tentang halaman.
- \`<body>\` berisi konten yang terlihat pada halaman seperti teks, gambar, dll.
    `,
    quiz: [
      {
        question: "Kepanjangan dari HTML adalah...",
        options: ["HyperLinks and Text Markup Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyper Tool Markup Language"],
        correctAnswer: 1,
        explanation: "HTML singkatan dari HyperText Markup Language."
      },
      {
        question: "Elemen apa yang berisi semua konten yang terlihat pada halaman web?",
        options: ["<head>", "<title>", "<body>", "<html>"],
        correctAnswer: 2,
        explanation: "Elemen <body> membungkus semua konten visual yang dilihat pengguna."
      }
    ]
  },
  {
    id: 'elemen-teks',
    title: 'Elemen Teks di HTML',
    icon: 'Type',
    content: `
# Elemen Teks di HTML

Ada beberapa tag HTML populer untuk memformat teks:

### 1. Heading (Judul)
Heading digunakan untuk membuat judul. Ukuran terbesar adalah \`h1\`, terkecil adalah \`h6\`.

\`\`\`html
<h1>Ini Judul Utama</h1>
<h2>Ini Sub Judul</h2>
\`\`\`

### 2. Paragraf
Tag \`<p>\` mendefinisikan sebuah paragraf.

\`\`\`html
<p>Ini adalah sebuah paragraf teks biasa.</p>
\`\`\`

### 3. Formatting Text
Beberapa tag untuk format teks khusus:
- \`<b>\` / \`<strong>\`: Huruf tebal
- \`<i>\` / \`<em>\`: Huruf miring
- \`<u>\`: Garis bawah
- \`<br>\`: Pindah baris (Line break)

\`\`\`html
<p>Teks ini <strong>tebal</strong>, yang ini <em>miring</em>.</p>
\`\`\`
    `,
    quiz: [
      {
        question: "Tag mana yang digunakan untuk membuat judul paling besar?",
        options: ["<header>", "<h1>", "<heading>", "<h6>"],
        correctAnswer: 1,
        explanation: "<h1> adalah tag heading terbesar di HTML."
      },
      {
        question: "Bagaimana cara membuat teks menjadi tebal?",
        options: ["<bold>", "<br>", "<b> atau <strong>", "<thick>"],
        correctAnswer: 2,
        explanation: "Tag <b> dan <strong> digunakan untuk membuat teks tebal."
      }
    ]
  }
];

export const ALGORITMA_SMP_TOPICS: Topic[] = [
  {
    id: 'intro-algoritma',
    title: 'Apa itu Algoritma?',
    icon: 'Lightbulb',
    content: `
# Pengertian Algoritma (Fase D)

Algoritma adalah urutan langkah-langkah logis dan sistematis untuk menyelesaikan suatu masalah. Dalam kehidupan sehari-hari, kita sering menggunakan algoritma tanpa disadari.

### Mengapa Belajar Algoritma?
1. **Berpikir Logis**: Membantu kita berpikir secara teratur.
2. **Pemecahan Masalah**: Masalah rumit jadi lebih mudah jika dibagi menjadi langkah-langkah kecil.
3. **Persiapan Pemrograman**: Komputer membutuhkan instruksi yang sangat detail dan berurutan.

### Contoh Sederhana
Algoritma mencuci tangan:
1. Basahi tangan dengan air.
2. Tuangkan sabun secukupnya.
3. Gosok telapak tangan, punggung tangan, dan sela jari.
4. Bilas dengan air bersih.
5. Keringkan tangan.
    `,
    quiz: [
      {
        question: "Urutan langkah-langkah logis untuk menyelesaikan masalah disebut?",
        options: ["Pola", "Algoritma", "Abstraksi", "Dekomposisi"],
        correctAnswer: 1,
        explanation: "Algoritma adalah serangkaian instruksi berurutan untuk menyelesaikan tugas."
      },
      {
        question: "Apa syarat utama sebuah algoritma?",
        options: ["Harus ditulis di komputer", "Harus sulit dipahami", "Harus logis dan sistematis", "Harus memiliki gambar berwarna"],
        correctAnswer: 2,
        explanation: "Langkah-langkah dalam algoritma harus masuk akal (logis) dan tersusun secara teratur (sistematis)."
      }
    ]
  },
  {
    id: 'visualisasi-flowchart',
    title: 'Flowchart (Diagram Alir)',
    icon: 'GitBranch',
    content: `
# Mengenal Flowchart secara Visual

Flowchart adalah representasi grafis dari sebuah algoritma. Kita menggunakan simbol-simbol khusus untuk menunjukkan jenis instruksi.

### Simbol dan Maknanya

| Simbol | Bentuk | Nama | Fungsi |
| :--- | :--- | :--- | :--- |
| 🟢 | Oval | Terminator | Awal atau Akhir |
| 🟦 | Persegi Panjang | Process | Perhitungan atau Penugasan |
| 🔷 | Belah Ketupat | Decision | Pilihan atau Kondisi |
| ▱ | Jajar Genjang | Input/Output | Baca data atau Cetak hasil |
| ➡️ | Panah | Arrow | Alur algoritma |

### Contoh Visual Flowchart: "Lampu Menyala?"
\`\`\`
       ┌──────────┐
       │  START   │
       └─────┬────┘
             │
             v
      ┌──────────────┐
      │Lampu Menyala?│──Ya──> [ SELESAI ]
      └──────┬───────┘
             │ Tidak
             v
      ┌──────────────┐
      │Pasang Lampu  │
      │    Baru      │
      └──────┬───────┘
             │
             v
        ┌────────┐
        │  END   │
        └────────┘
 \`\`\`
    `,
    quiz: [
      {
        question: "Simbol belah ketupat (Diamond) dalam flowchart digunakan untuk?",
        options: ["Selesai", "Proses", "Kondisi/Keputusan", "Judul"],
        correctAnswer: 2,
        explanation: "Simbol belah ketupat digunakan saat ada pilihan Ya atau Tidak (Keputusan)."
      },
      {
        question: "Arah aliran dalam flowchart ditunjukkan oleh simbol?",
        options: ["Kotak", "Garis Panah", "Lingkaran", "Segitiga"],
        correctAnswer: 1,
        explanation: "Panah menunjukkan aliran logis dari satu langkah ke langkah berikutnya."
      }
    ]
  },
  {
    id: 'pseudocode',
    title: 'Pseudocode',
    icon: 'Code',
    content: `
# Mengenal Pseudocode

**Pseudocode** (kode semu) adalah cara menuliskan algoritma yang menyerupai bahasa pemrograman tetapi tetap mudah dibaca oleh manusia.

### Mengapa menggunakan Pseudocode?
- Lebih detail daripada bahasa sehari-hari.
- Tidak terikat aturan sintaks bahasa pemrograman tertentu (bebas).
- Memudahkan programmer sebelum mulai mengetik kode asli.

### Aturan Umum
- Gunakan kata kunci seperti **IF, THEN, ELSE, WHILE, FOR**.
- Gunakan **INPUT** dan **OUTPUT**.
- Gunakan **SET** atau **COMPUTE** untuk perhitungan.

### Contoh Pseudocode: Menghitung Luas Persegi
\`\`\`
PROGRAM luas_persegi
DEKLARASI:
   sisi, luas : INTEGER
ALGORITMA:
   INPUT(sisi)
   SET luas = sisi * sisi
   OUTPUT(luas)
END
 \`\`\`
    `,
    quiz: [
      {
        question: "Manakah pernyataan yang benar tentang Pseudocode?",
        options: ["Hanya bisa dibaca komputer", "Bahasa pemrograman yang sangat sulit", "Deskripsi algoritma menyerupai kode program", "Sama dengan Flowchart"],
        correctAnswer: 2,
        explanation: "Pseudocode adalah deskripsi logis yang mendekati struktur kode pemrograman sesungguhnya."
      },
      {
        question: "Kata kunci apa yang sering digunakan di Pseudocode untuk mengambil data?",
        options: ["PRINT", "IF", "INPUT", "WHILE"],
        correctAnswer: 2,
        explanation: "INPUT digunakan untuk menerima data dari pengguna atau sensor."
      }
    ]
  },
  {
    id: 'kasus-lingkaran',
    title: 'Studi Kasus: Luas Lingkaran',
    icon: 'Globe',
    content: `
# Studi Kasus: Luas Lingkaran

Mari kita gabungkan Flowchart dan Pseudocode untuk menyelesaikan satu masalah: **Menghitung Luas Lingkaran**.

**Rumus:** Luas = 3.14 x r x r

### 1. Representasi Pseudocode
\`\`\`
SET PI = 3.14
INPUT r
COMPUTE luas = PI * r * r
PRINT luas
 \`\`\`

### 2. Representasi Flowchart Visual
\`\`\`
       ┌──────────┐
       │  START   │
       └─────┬────┘
             │
             v
      ┌──────────────┐
      │ SET PI = 3.14│
      └──────┬───────┘
             │
             v
      ┌──────────────┐
      │   INPUT r    │ (Jajar Genjang)
      └──────┬───────┘
             │
             v
      ┌──────────────┐
      │ luas = PI*r*r│ (Persegi Panjang)
      └──────┬───────┘
             │
             v
      ┌──────────────┐
      │  PRINT luas  │ (Output)
      └──────┬───────┘
             │
             v
        ┌────────┐
        │  END   │
        └────────┘
 \`\`\`
    `,
    quiz: [
      {
        question: "Dalam algoritma luas lingkaran, r * r termasuk ke dalam tahap?",
        options: ["Input", "Output", "Proses", "Kondisi"],
        correctAnswer: 2,
        explanation: "Perhitungan matematika atau rumus adalah bagian dari tahap Proses."
      },
      {
        question: "Jika jari-jari adalah 10, berapa hasil luasnya?",
        options: ["31.4", "314", "3.14", "100"],
        correctAnswer: 1,
        explanation: "3.14 * 10 * 10 = 314."
      }
    ]
  },
  {
    id: 'struktur-dasar',
    title: 'Struktur Dasar: Perulangan',
    icon: 'Repeat',
    content: `
# Struktur Perulangan (Looping)

Dalam algoritma, seringkali kita butuh melakukan hal yang sama berkali-kali. Ini disebut **Iterasi** atau **Perulangan**.

### Visualisasi Perulangan
\`\`\`
       ┌──────────┐
       │  START   │
       └─────┬────┘
             │
             v
      ┌──────────────┐
      │  Hitung = 1  │
      └──────┬───────┘
             │
      ┌──────v───────┐
      │ Hitung <= 5? │──Tidak─> [ SELESAI ]
      └──────┬───────┘
             │ Ya
             v
      ┌──────────────┐
      │ Tampilkan Angka│
      └──────────────┘
             │
             v
      ┌──────────────┐
      │ Hitung = H+1 │
      └──────┬───────┘
             │
             └───────┘
 \`\`\`
    `,
    quiz: [
      {
        question: "Simbol belah ketupat (diamond) pada flowchart di atas melambangkan?",
        options: ["Input/Output", "Proses", "Kondisi/Keputusan", "Selesai"],
        correctAnswer: 2,
        explanation: "Belah ketupat digunakan untuk percabangan atau pengambilan keputusan (IF/ELSE)."
      },
      {
        question: "Berapa kali 'Tampilkan Angka' akan dijalankan jika kondisinya Hitung <= 5?",
        options: ["1 kali", "4 kali", "5 kali", "Selamanya"],
        correctAnswer: 2,
        explanation: "Karena hitungan dimulai dari 1 sampai 5, maka blok tersebut dieksekusi 5 kali."
      }
    ]
  }
];

export const BERPIKIR_KOMPUTASI_TOPICS: Topic[] = [
  {
    id: 'pengenalan-bk',
    title: 'Apa itu Berpikir Komputasional?',
    icon: 'Lightbulb',
    content: `
# Apa itu Berpikir Komputasional? (Deep Dive)

Berpikir komputasional (Computational Thinking) bukan berarti berpikir seperti komputer yang "kaku". Sebaliknya, ini adalah tentang bagaimana manusia memberdayakan otak mereka untuk merancang solusi yang sangat jelas sehingga mesin pun bisa menjalankannya.

### 1. Sejarah Singkat
Istilah ini dipopulerkan oleh **Seymour Papert** (1980) dan dikembangkan oleh **Jeannette Wing** (2006). Awalnya dianggap hanya untuk pemrogram, kini diakui sebagai "keterampilan dasar bagi semua orang" di abad ke-21.

### 2. Apa Saja 4 Pilar Utamanya?
- **Dekomposisi**: Membongkar gumpalan masalah besar menjadi serpihan kecil yang bisa dikelola satu per satu.
- **Pengenalan Pola**: Menemukan tren, kesamaan, atau perilaku berulang dalam data untuk memprediksi hasil.
- **Abstraksi**: Teknik "menyaring" informasi. Jika kita sedang belajar mengemudi, kita fokus pada setir dan rem (abstraksi), bukan pada cara piston mesin bergerak.
- **Algoritma**: Puncak dari segalanya, yaitu menyusun langkah-langkah robotik yang logis dan efisien.

### 3. Mengapa Ini Penting di Era AI?
Di dunia yang penuh dengan kecerdasan buatan, kemampuan untuk merumuskan pertanyaan dan memecah masalah menjadi instruksi logis adalah satu-satunya cara kita tetap memiliki kendali atas teknologi. Ini membantu kita berpikir kritis dan obyektif.

### 4. Contoh Nyata Sehari-hari
Saat kamu merencanakan pesta ulang tahun:
- **Dekomposisi**: Kamu membagi tugas (beli kue, undang teman, sewa tempat).
- **Pola**: Kamu ingat bahwa tahun lalu kue cokelat lebih disukai.
- **Abstraksi**: Kamu tidak peduli bagaimana toko kue membuat tepungnya, yang penting kuenya jadi.
- **Algoritma**: Kamu membuat *checklist* jadwal acara dari jam 7 sampai jam 9.
    `,
    quiz: [
      {
        question: "Siapa tokoh yang mempopulerkan Computational Thinking pada tahun 2006?",
        options: ["Bill Gates", "Jeannette Wing", "Steve Jobs", "Mark Zuckerberg"],
        correctAnswer: 1,
        explanation: "Jeannette Wing mendefinisikan CT sebagai keterampilan dasar yang harus dimiliki setiap orang, bukan hanya ilmuwan komputer."
      },
      {
        question: "Manakah pilar yang berfungsi menyaring detail tidak relevan?",
        options: ["Algoritma", "Abstraksi", "Dekomposisi", "Optimasi"],
        correctAnswer: 1,
        explanation: "Abstraksi membuang detail yang tidak perlu agar kita bisa fokus pada model intinya."
      }
    ]
  },
  {
    id: 'dekomposisi-pola',
    title: 'Dekomposisi & Pengenalan Pola',
    icon: 'Puzzle',
    content: `
# Mendalami Dekomposisi & Pengenalan Pola

Tanpa dua pilar ini, masalah besar akan terlihat menakutkan (overwhelming).

### 1. Strategi Dekomposisi (Break It Down)
Bayangkan kamu diminta membuat aplikasi seperti Instagram. Terlalu besar? Gunakan dekomposisi:
- Bagian Profil User.
- Bagian Upload Gambar.
- Bagian Scroll Feed.
- Bagian Notifikasi.
Setiap bagian ini disebut "sub-masalah". Mengerjakan sub-masalah satu per satu jauh lebih cepat daripada mencoba mengerjakan semuanya sekaligus.

### 2. Kekuatan Pengenalan Pola (Prediction)
Setelah masalah dipecah, pola mulai muncul. 
- **Dalam Kedokteran**: Dokter melihat pola gejala (batuk, demam, hilang indra penciuman) untuk mendiagnosis penyakit tanpa harus melakukan tes yang sangat rumit setiap hari.
- **Dalam Matematika**: Jika kamu tahu pola perkalian 5 (belakangnya selalu 0 atau 5), kamu bisa menghitung 5 x 283 tanpa ragu.

### 3. Mengapa Keduanya Berpasangan?
Dekomposisi menciptakan "pecahan-pecahan", dan Pengenalan Pola mencari tahu apakah pecahan tersebut pernah kita temui sebelumnya. Jika polanya sama, kita tidak perlu membuat solusi dari nol!

### Tantangan Latihan
Coba dekomposisikan proses "Memasak Nasi Goreng Spesial". Apa saja sub-tugasnya? Apa pola bumbu yang biasanya selalu sama di setiap masakan tumis?
    `,
    quiz: [
      {
        question: "Apa manfaat utama dari teknik Dekomposisi?",
        options: ["Memperindah tampilan", "Mengurangi biaya listik", "Memudahkan penyelesaian tugas yang kompleks", "Menghapus kode yang error"],
        correctAnswer: 2,
        explanation: "Dengan memecah tugas, kita bisa fokus pada satu bagian kecil yang lebih mudah dikontrol."
      },
      {
        question: "Pengenalan pola dalam teknologi pengenal wajah (Face ID) digunakan untuk...",
        options: ["Menghemat baterai", "Membedakan struktur wajah pemilik dengan orang lain", "Meningkatkan resolusi kamera", "Menghapus jerawat otomatis"],
        correctAnswer: 1,
        explanation: "Algoritma mengenali pola jarak mata, hidung, dan mulut untuk identifikasi."
      }
    ]
  },
  {
    id: 'abstraksi-algoritma',
    title: 'Abstraksi & Algoritma',
    icon: 'GitCommit',
    content: `
# Abstraksi & Algoritma: Dari Ide ke Solusi

Ini adalah tahap di mana rencana berubah menjadi instruksi yang siap dieksekusi.

### 1. Abstraksi: Seni Menyederhanakan
Abstraksi bukan berarti membuang data, tapi memilih data yang **paling berpengaruh**.
- **Contoh Dashboard Mobil**: Kamu hanya butuh kecepatan (Spidometer) dan sisa bensin. Kamu tidak butuh tahu berapa suhu busi atau tekanan oli secara detail setiap detik. Itulah abstraksi yang baik.
- **Tujuan**: Menghindari kebingungan karena terlalu banyak informasi (Information Overload).

### 2. Algoritma: Resep Solusi
Algoritma harus memenuhi 3 syarat utama:
- **Finiteness**: Harus berhenti (tidak boleh berputar selamanya).
- **Definiteness**: Setiap langkah harus jelas (tidak boleh bilang "tambahkan bumbu secukupnya", tapi harus "tambahkan 1 sendok teh garam").
- **Efficiency**: Jika ada dua cara sampai ke sekolah, ambil yang paling cepat atau paling murah.

### 3. Kompleksitas Algoritma (Big O - Sederhana)
Ilmuwan komputer mengukur "kepintaran" algoritma bukan dari warnanya, tapi dari kecepatannya saat data bertambah banyak.
- Algoritma yang bagus: Kecepatannya tetap saat data bertambah (O(1)).
- Algoritma standar: Kecepatannya melambat seiring bertambahnya data (O(n)).

### Kesimpulan
Abstraksi membangun **model**, dan Algoritma menjalankan **prosesnya**.
    `,
    quiz: [
      {
        question: "Mana yang merupakan contoh Abstraksi pada sebuah peta navigasi?",
        options: ["Menampilkan setiap daun di pepohonan", "Menampilkan nama jalan dan arah lalu lintas saja", "Menampilkan warna genteng rumah warga", "Menampilkan nomor seri tiang listrik"],
        correctAnswer: 1,
        explanation: "Peta mengabaikan detail fisik yang tidak perlu untuk tujuan navigasi."
      },
      {
        question: "Syarat 'Finiteness' dalam algoritma berarti...",
        options: ["Langkah harus sulit", "Langkah tidak boleh berakhir", "Langkah harus memiliki titik akhir yang jelas", "Langkah harus digambar"],
        correctAnswer: 2,
        explanation: "Finiteness artinya algoritma harus berhenti setelah mengerjakan tugasnya."
      }
    ]
  },
  {
    id: 'ekspresi-logika',
    title: 'Ekspresi Logika (Boolean)',
    icon: 'Brain',
    content: `
# Ekspresi Logika (Boolean) & Tabel Kebenaran

Komputer adalah mesin yang sangat jujur. Baginya, segala sesuatu adalah antara **BENAR (TRUE)** atau **SALAH (FALSE)**.

### 1. Kenapa Namanya Boolean?
Diambil dari nama **George Boole**, matematikawan yang menciptakan aljabar logika. Aljabar ini menjadi dasar dari semua sirkuit prosesor di HP dan laptopmu.

### 2. Tabel Kebenaran (The Truth Table)
Mari kita lihat bagaimana operator bekerja jika digabungkan:

| Input A | Input B | A AND B | A OR B | NOT A |
| :--- | :--- | :--- | :--- | :--- |
| True | True | **True** | **True** | False |
| True | False | False | **True** | False |
| False | True | False | **True** | **True** |
| False | False | False | False | **True** |

### 3. Logika Bersusun
Seringkali keputusan diambil dari banyak syarat.
- **Contoh**: "Saya akan beli es krim JIKA (Punya Uang) AND (Toko Buka) AND (NOT Sedang Batuk)".
- Jika salah satu syarat \`Punya Uang\` atau \`Toko Buka\` bernilai FALSE, atau jika \`Sedang Batuk\` bernilai TRUE, maka hasilnya adalah **FALSE** (tidak jadi beli).

### 4. Implementasi dalam Coding
Dalam bahasa pemrograman, ini sering digunakan dalam perintah \`if-else\` untuk mengarahkan alur program.
    `,
    quiz: [
      {
        question: "Jika A = False, maka hasil dari NOT A adalah...",
        options: ["True", "False", "Error", "Mungkin"],
        correctAnswer: 0,
        explanation: "Operator NOT membalikkan nilai logika."
      },
      {
        question: "Hasil dari (True AND False) OR (True) adalah...",
        options: ["False", "Null", "True", "A dan B Benar"],
        correctAnswer: 2,
        explanation: "(True AND False) adalah False. Lalu (False OR True) adalah True."
      }
    ]
  },
  {
    id: 'bilangan-biner-heksa',
    title: 'Sistem Bilangan: Biner & Heksa',
    icon: 'Database',
    content: `
# Rahasia Angka Komputer: Biner & Heksa

Pernahkah kamu berpikir bagaimana gambar kucing bisa disimpan dalam kabel? Rahasianya adalah angka.

### 1. Biner (Bit & Byte)
Komputer hanya mengerti arus listrik (On/Off). 
- 1 angka biner (0 atau 1) disebut **1 BIT**.
- 8 angka biner yang digabung disebut **1 BYTE**.
- 1 Byte bisa mewakili 1 huruf (misal huruf 'A' adalah \`01000001\`).

### 2. Kenapa Heksadesimal Penting?
Biner sangat panjang dan susah dibaca manusia. Contoh:
- Warna Biru Tua: \`1000000011111111\` (Susah kan?)
- Dalam Heksa: \`#00008B\` (Lebih mudah!)
Heksadesimal menggunakan 16 simbol: **0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F**.

### 3. Kode Warna Web (RGB)
Hampir semua warna di layar monitor menggunakan kombinasi 3 angka Heksadesimal:
- **Red (Merah)**
- **Green (Hijau)**
- **Blue (Biru)**
Contoh: \`#FF0000\` adalah Merah murni (Merah penuh, Hijau 0, Biru 0).

### Tips Konversi Cepat
Setiap **1 digit Heksa** mewakili **4 digit Biner**. 
- F (15) = 1111.
- 0 = 0000.
    `,
    quiz: [
      {
        question: "Berapakah jumlah bit dalam 1 byte?",
        options: ["4 bit", "8 bit", "10 bit", "16 bit"],
        correctAnswer: 1,
        explanation: "Secara standar internasional, 1 byte terdiri dari 8 bit data."
      },
      {
        question: "Huruf 'C' dalam heksadesimal merepresentasikan angka desimal...",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        explanation: "A=10, B=11, C=12."
      }
    ]
  },
  {
    id: 'struktur-data-list-stack',
    title: 'Struktur Data: List & Stack',
    icon: 'Repeat',
    content: `
# Struktur Data Masa Depan: List, Stack, & Queue

Data yang berantakan tidak akan berguna. Kita butuh cara mengaturnya.

### 1. List (Array Dinamis)
Daftar yang bisa bertambah atau berkurang ukurannya di tengah jalan.
- **Akses Cepat**: Bisa langsung loncat ke item nomor 500 (O(1)).
- **Masalah**: Jika menghapus item di awal, semua item di belakangnya harus digeser (Lambat!).

### 2. Stack (Tumpukan / LIFO)
Bayangkan tumpukan piring atau tumpukan kartu.
- Kamu hanya bisa mengambil yang paling atas (**Top**).
- Fungsi **Undo** di aplikasi (Photoshop/Word) menggunakan Stack. Saat kamu klik Undo, aplikasi mengambil aksi terakhirmu dari tumpukan dan membatalkannya.

### 3. Queue (Antrean / FIFO)
Bayangkan antrean di kasir atau printer di kantor.
- Yang pertama masuk (Print dokumen A) adalah yang pertama dicetak.
- Sangat penting dalam sistem pesan (Messaging apps) agar pesan tidak tertukar urutannya.

### Mana yang Paling Bagus?
Tidak ada yang terbaik. Gunakan **Stack** jika kamu butuh membatalkan aksi terakhir. Gunakan **Queue** jika kamu ingin melayani orang sesuai urutan datang.
    `,
    quiz: [
      {
        question: "Fitur 'History' di browser yang memungkinkan kita klik 'Back' menggunakan konsep...",
        options: ["List", "Queue", "Stack", "Tree"],
        correctAnswer: 2,
        explanation: "Back berarti kembali ke halaman terakhir yang dibuka (Last In First Out), maka menggunakan Stack."
      },
      {
        question: "Konsep FIFO (First In First Out) identik dengan...",
        options: ["Tumpukan Piring", "Antrean Tiket", "Daftar Kontak", "Buku Catatan"],
        correctAnswer: 1,
        explanation: "Queue atau Antrean mengikuti prinsip siapa yang datang dulu, dia yang dilayani dulu."
      }
    ]
  }
];

export const TEKNOLOGI_INFORMASI_KOMPUTASI_TOPICS: Topic[] = [
  {
    id: 'integrasi-aplikasi-perkantoran',
    title: 'Integrasi Konten Aplikasi Perkantoran',
    icon: 'Layers',
    content: `
# Integrasi Konten Aplikasi Perkantoran (Advanced)

Di dunia profesional, efisiensi adalah segalanya. Kita tidak punya waktu untuk mengetik ulang data yang sama di aplikasi berbeda.

### 1. Apa itu Integrasi Perkantoran?
Proses menghubungkan data antar aplikasi dalam paket perkantoran (seperti Microsoft Office atau Google Workspace). Contohnya, kamu punya data angka di **Excel**, lalu ingin menampilkannya sebagai grafik di **PowerPoint** atau surat di **Word**.

### 2. Teknik Utama OLE (Object Linking and Embedding)
- **Object Embedding**: Data ditempelkan sepenuhnya. Jika kamu mengirim file Word-nya ke orang lain, grafiknya tetap ada, tapi jika file Excel aslinya berubah, grafik di Word **TIDAK** ikut berubah.
- **Object Linking**: Hanya menempelkan "jendela" ke file asli. File Word akan selalu mengecek file Excel. Jika Excel diupdate, Word otomatis ikut berubah. *Syaratnya: file asli tidak boleh dipindah folder.*

### 3. Fitur Mail Merge (Surat Massal)
Fitur yang sangat sakti untuk membuat ratusan surat atau sertifikat dalam hitungan detik.
- **Source**: Data nama dan alamat di Excel.
- **Main Document**: Desain surat di Word.
- **Hasil**: Word akan otomatis mengganti kolom [Nama] dengan nama-nama dari Excel satu per satu.

### 4. Studi Kasus
Seorang sekretaris ingin membuat laporan bulanan. Ia menggunakan **Excel** untuk menghitung total penjualan, lalu menggunakan **Copy-Special (Paste Link)** agar tabel tersebut muncul di **Word**. Saat ada revisi angka di Excel sore hari, laporan Word-nya sudah otomatis benar tanpa perlu diedit ulang.
    `,
    quiz: [
      {
        question: "Apa perbedaan utama antara Linking dan Embedding?",
        options: ["Embedding lebih lambat", "Linking menyinkronkan data secara otomatis jika file sumber berubah", "Embedding memerlukan koneksi internet", "Linking menghapus file asli"],
        correctAnswer: 1,
        explanation: "Linking membuat koneksi aktif antara dua file, sehingga perubahan data di satu file akan merembet ke file lainnya."
      },
      {
        question: "Fitur untuk membuat sertifikat massal dengan data dari tabel disebut...",
        options: ["Fast Mail", "Mail Merge", "Quick Certificate", "Data Source"],
        correctAnswer: 1,
        explanation: "Mail Merge menggabungkan dokumen master dengan sumber data (spreadsheet) secara otomatis."
      }
    ]
  },
  {
    id: 'blog',
    title: 'Blog',
    icon: 'FileText',
    content: `
# Menjadi Blogger Profesional: Lebih dari Sekadar Tulisan

Blog bukan hanya buku harian digital, tapi bisa menjadi aset digital yang bernilai.

### 1. Struktur Blog yang Baik
Sebuah artikel blog yang berkualitas (SEO Friendly) biasanya terdiri dari:
- **Headline**: Judul yang menarik perhatian (Click-worthy).
- **Introduction**: Pembukaan yang membuat pembaca penasaran.
- **Body**: Isi utama yang dibagi dengan sub-heading (H2, H3) agar mudah dibaca sekilas (scanning).
- **Conclusion**: Ringkasan singkat.
- **CTA (Call to Action)**: Ajakan untuk berkomentar atau membagikan artikel.

### 2. Memilih Platform: Gratis vs Mandiri
- **Blogger/Medium**: Gratis, mudah, tapi fitur terbatas. Cocok untuk pemula.
- **Self-Hosted WordPress**: Berbayar (sewa hosting), tapi kamu punya kontrol penuh. Bisa dipasangi iklan, toko online, dan sistem rumit lainnya.

### 3. Apa itu SEO (Search Engine Optimization)?
Teknik agar blogmu muncul di halaman pertama Google.
- **Keyword**: Kata kunci yang sering dicari orang.
- **Backlink**: Tautan dari website lain ke blogmu.
- **Kecepatan**: Blog yang lambat akan ditinggalkan pembaca.

### 4. Etika & Keamanan Blog
- **Copyright**: Jangan asal ambil gambar dari Google. Gunakan situs foto gratis seperti *Unsplash* atau *Pexels*.
- **Moderasi Komentar**: Lindungi blogmu dari komentar spam yang berisi virus atau link judi.
    `,
    quiz: [
      {
        question: "Apa fungsi dari Sub-heading (H2/H3) dalam sebuah artikel blog?",
        options: ["Agar tulisan terlihat warna-warni", "Memudahkan pembaca memahami struktur dan poin-poin tulisan", "Menambah jumlah kata", "Syarat agar blog bisa didaftarkan iklan"],
        correctAnswer: 1,
        explanation: "Pembaca internet cenderung membaca sekilas, sub-heading membantu mereka menemukan poin penting dengan cepat."
      },
      {
        question: "Teknik optimasi agar blog mudah ditemukan di Google disebut...",
        options: ["SMM", "SEO", "CEO", "HTML"],
        correctAnswer: 1,
        explanation: "SEO (Search Engine Optimization) adalah strategi kunci bagi setiap blogger."
      }
    ]
  },
  {
    id: 'vlog',
    title: 'Vlog',
    icon: 'Video',
    content: `
# Dunia Vlogging: Narasi dalam Visual

Vlog adalah tentang bercerita (storytelling) menggunakan video.

### 1. Tahapan Produksi Video
- **Pra-Produksi**: Membuat naskah (script) atau garis besar cerita agar video tidak bertele-tele.
- **Produksi**: Proses syuting. Perhatikan *Rule of Thirds* dalam komposisi gambar.
- **Pasca-Produksi**: Editing (memotong bagian yang salah, menambah musik latar, memberi teks penjelas).

### 2. Kualitas vs Kuantitas
Banyak vlogger pemula fokus pada kamera mahal. Faktanya:
- **Audio adalah 70% video**: Orang lebih memaafkan gambar yang agak buram daripada suara yang berisik/pecah. Gunakan mic eksternal jika bisa.
- **Pencahayaan (Lighting)**: Syuting di dekat jendela di siang hari seringkali lebih bagus daripada lampu studio mahal.

### 3. Algoritma YouTube & Retensi Penonton
YouTube akan mempromosikan videomu jika penonton betah menonton lama (**Retention Rate**).
- **Tip**: Buat pembukaan yang "meledak" dalam 10 detik pertama.

### 4. Hak Cipta Musik
Jangan gunakan lagu populer tanpa izin, atau videomu akan di-*banned*. Gunakan **Youtube Audio Library** atau situs seperti *Epidemic Sound* untuk musik yang aman dari hak cipta.
    `,
    quiz: [
      {
        question: "Manakah komponen yang paling penting dalam kualitas sebuah Vlog menurut pakar?",
        options: ["Resolusi Kamera 4K", "Audio/Suara yang Jelas", "Banyaknya Efek Transisi", "Mahalnya Harga Tripod"],
        correctAnswer: 1,
        explanation: "Penonton akan segera menutup video jika suara pembicara tidak terdengar jelas atau terganggu kebisingan."
      },
      {
        question: "Apa tujuan utama dari proses Pra-Produksi?",
        options: ["Mengedit warna video", "Memasukkan musik", "Merencanakan alur cerita dan naskah", "Mengunggah video ke internet"],
        correctAnswer: 2,
        explanation: "Perencanaan yang matang mencegah kebingungan saat proses syuting berlangsung."
      }
    ]
  },
  {
    id: 'perangkat-komputer',
    title: 'Perangkat Keras & Perangkat Lunak',
    icon: 'Monitor',
    content: `
# Jantung Teknologi: Hardware, Software, & Brainware

Komputer tidak akan berguna tanpa ketiga komponen ini saling bekerja sama.

### 1. Perangkat Keras (Hardware) - Si Fisik
- **Prosesor (CPU)**: Bukan kotak besarnya, tapi chip kecil di dalamnya yang melakukan jutaan hitungan per detik.
- **Memori (RAM)**: "Meja kerja" komputer. Semakin besar RAM, semakin banyak aplikasi yang bisa dibuka sekaligus (**Multitasking**).
- **Penyimpanan (SSD vs HDD)**: SSD jauh lebih cepat dari HDD karena tidak memiliki piringan berputar. Laptop modern wajib pakai SSD agar tidak lelet.

### 2. Perangkat Lunak (Software) - Si Pikiran
- **System Software**: Seperti Windows atau Android. Mereka yang "membangunkan" hardware saat tombol power ditekan.
- **Drivers**: Software kecil yang menjadi penerjemah antara hardware (misal printer) dengan komputer. Tanpa driver yang benar, printer tidak akan jalan.

### 3. Masalah Umum (Troubleshooting)
- **Komputer Lambat**: Biasanya karena RAM penuh atau terlalu banyak aplikasi yang berjalan di latar belakang (Background Process).
- **Blue Screen**: Tanda ada kerusakan serius pada modul hardware atau driver yang bentrok.

### 4. Brainware (Manusia)
Operator yang memberi perintah. Manusia yang hebat harus tahu cara menggunakan hardware dan software secara optimal.
    `,
    quiz: [
      {
        question: "Komponen mana yang paling berpengaruh pada kecepatan saat membuka banyak aplikasi sekaligus?",
        options: ["Layar Monitor", "Casing", "RAM", "Mouse"],
        correctAnswer: 2,
        explanation: "RAM adalah area kerja sementara. Jika RAM sempit, komputer akan melambat saat multitasking."
      },
      {
        question: "Software yang berfungsi sebagai 'Penerjemah' antara hardware eksternal dengan sistem disebut...",
        options: ["Office", "Driver", "Antivirus", "Editor"],
        correctAnswer: 1,
        explanation: "Driver memberitahu sistem operasi cara berinteraksi dengan hardware tertentu (Printer, VGA, dll)."
      }
    ]
  },
  {
    id: 'jaringan-internet',
    title: 'Jaringan Komputer & Internet',
    icon: 'Globe',
    content: `
# Internet: Jaringan yang Menyatukan Dunia

Internet adalah kumpulan jutaan jaringan kecil yang saling "berbicara".

### 1. Bagaimana Data Bergerak?
Saat kamu mengetik \`google.com\`:
1. **DNS (Domain Name System)**: Komputer mencari alamat IP (seperti nomor telepon) untuk google.com. DNS adalah buku telepon internet.
2. **Paket Data**: Gambar atau video dipecah menjadi ribuan paket kecil.
3. **Router**: Alat ini seperti polisi lalu lintas yang mengarahkan paket tersebut melalui jalur tercepat (lewat kabel bawah laut atau satelit).

### 2. Alamat IP (IPv4 vs IPv6)
- **IPv4**: Contoh formatnya \`192.168.1.1\`. Karena jumlah manusia yang pakai internet makin banyak, IPv4 sudah hampir habis.
- **IPv6**: Format yang lebih panjang dan modern, memastikan triliunan perangkat baru (smart home, jam tangan digital) bisa punya alamat sendiri.

### 3. Keamanan Protokol (HTTP vs HTTPS)
- **HTTP**: Data dikirim dalam bentuk teks biasa. Bahaya jika ada orang jahat yang menyadap di tengah jalan.
- **HTTPS (dengan SSL)**: Data "dibungkus" dengan enkripsi. Hanya pengirim dan penerima yang bisa membacanya. *Pastikan ada ikon gembok di browser saat belanja online!*

### 4. WiFi vs Kabel LAN
WiFi menawarkan kenyamanan (tanpa kabel), tapi kabel LAN jauh lebih stabil dan tahan gangguan untuk bermain game atau video conference.
    `,
    quiz: [
      {
        question: "Protokol mana yang lebih aman untuk transaksi data sensitif?",
        options: ["HTTP", "HTTPS", "FTP", "POP3"],
        correctAnswer: 1,
        explanation: "HTTPS mengacak data sehingga tidak bisa dibaca oleh penyadap."
      },
      {
        question: "DNS (Domain Name System) sering disebut sebagai...",
        options: ["Mesin Pencari", "Buku Telepon Internet", "Iklan Internet", "Server Game"],
        correctAnswer: 1,
        explanation: "DNS mengubah nama domain yang mudah diingat (google.com) menjadi alamat IP (angka)."
      }
    ]
  },
  {
    id: 'keamanan-data',
    title: 'Keamanan Data di Internet',
    icon: 'Shield',
    content: `
# Benteng Digital: Menjaga Data di Dunia Maya

Serangan tidak lagi pakai pedang, tapi pakai kode.

### 1. Social Engineering (Manipulasi Psikologis)
Taktik paling berbahaya di mana penjahat tidak meretas komputermu, tapi meretas "otakmu".
- **Contoh**: Seseorang menelpon mengaku dari bank dan meminta kode OTP dengan alasan hadiah. Jangan pernah berikan kode OTP kepada siapapun!

### 2. Apa itu Malware?
Singkatan dari **Malicious Software** (Software Jahat).
- **Ransomware**: Mengunci file di laptopmu dan meminta uang tebusan.
- **Spyware**: Diam-diam merekam apa yang kamu ketik (termasuk password) dan mengirimkannya ke penjahat.

### 3. Password yang Kuat?
Jangan gunakan \`123456\` atau \`tanggal lahir\`. Gunakan metode **Passphrase**: Gabungkan 3 kata acak yang mudah diingat tapi susah ditebak, misal: \`GajahMakanPizza77!\`.

### 4. Pentingnya Update Berkala
Perusahaan seperti Google atau Microsoft sering menemukan "lubang" di software mereka. Mereka membuat "tambalan" (**Patch**) melalui update. Jika kamu malas update, lubang tersebut tetap terbuka untuk dimasuki hacker.

### Tips Terakhir
Gunakan **Incognito Mode** jika memakai komputer publik, dan selalu **Logout** dari akun media sosialmu.
    `,
    quiz: [
      {
        question: "Apa singkatan dari Malware?",
        options: ["Mail Software", "Malicious Software", "Main Software", "Multi Software"],
        correctAnswer: 1,
        explanation: "Malicious berarti berniat jahat/merusak."
      },
      {
        question: "Langkah terbaik jika menerima pesan WhatsApp tidak dikenal berisi file '.APK' atau link mencurigakan adalah?",
        options: ["Langsung klik untuk tahu isinya", "Blokir nomor tersebut dan jangan buka file-nya", "Kirim balik ke orang lain", "Simpan di folder dokumen"],
        correctAnswer: 1,
        explanation: "File .APK dari sumber tidak jelas seringkali berisi spyware yang bisa mencuri data banking."
      }
    ]
  }
];

export const SCRATCH_TOPICS: Topic[] = [
  {
    id: 'intro-scratch',
    title: 'Pengenalan & Antarmuka Scratch',
    icon: 'Gamepad2',
    content: `
# Pengenalan Pemrograman Visual Scratch 3.0

Selamat datang di dunia **Scratch**! Scratch adalah bahasa pemrograman visual berbasis balok (*block-based visual programming*) yang dikembangkan oleh **MIT Media Lab**. Scratch dirancang khusus agar siswa dapat belajar konsep logika pemrograman komputer secara seru dan intuitif tanpa harus takut salah mengetik sintaks (*syntax error*) seperti koma atau titik-koma.

![Diagram Antarmuka Editor Scratch 3.0](/src/assets/images/scratch_interface_1794090375318.jpg)

### Mengapa Belajar Scratch?
1. **Berpikir Komputasional (Computational Thinking)**: Melatih pemecahan masalah (*problem solving*), dekomposisi masalah besar menjadi langkah-langkah kecil, dan pengenalan pola algoritma.
2. **Kreativitas & Kolaborasi**: Kamu dapat merancang animasi cerita, permainan video arcade 2D interaktif, musik digital, hingga simulasi sains.
3. **Fondasi Coding Profesional**: Memahami logika inti seperti *event-driven programming*, perulangan (*loop*), percabangan kondisi (*if-then-else*), variabel skor, serta deteksi sentuhan (*collision sensing*).

---

### Anatomi Antarmuka Editor Scratch

Perhatikan gambar arsitektur antarmuka di atas. Ruang kerja Scratch terbagi rapi menjadi 4 bagian esensial:

| Bagian | Nama Area | Fungsi Utama |
| :--- | :--- | :--- |
| **1** | **Block Palette (Kiri)** | Lemari balok kode warna-warni yang dikelompokkan berdasarkan kategori (Gerakan, Tampilan, Suara, Kejadian, dll). |
| **2** | **Scripts Area (Tengah)** | Lembar kanvas utama tempat menyusun dan merangkai balok-balok kode seperti kepingan puzzle. |
| **3** | **Stage (Kanan Atas)** | Panggung atau layar pertunjukan tempat karakter (**Sprite**) beraksi mengeksekusi instruksi balok. |
| **4** | **Sprite & Backdrop Pane (Kanan Bawah)** | Panel untuk menambah atau mengganti karakter (Sprite) dan latar panggung (Backdrop). |

> 💡 **Kontrol Eksekusi Program**:
> - Klik **Bendera Hijau (Green Flag)** di pojok atas panggung untuk memulai jalannya skrip program.
> - Klik tombol **Lingkaran Merah (Stop)** untuk menghentikan seketika seluruh animasi dan skrip yang sedang aktif.
    `,
    quiz: [
      {
        question: "Siapakah institusi pelopor yang mengembangkan bahasa pemrograman visual Scratch?",
        options: ["MIT Media Lab", "Microsoft Research", "Google AI Lab", "Oracle Academy"],
        correctAnswer: 0,
        explanation: "Scratch dikembangkan oleh Lifelong Kindergarten Group di MIT Media Lab agar anak-anak dan pemula mudah belajar coding."
      },
      {
        question: "Area pada antarmuka Scratch tempat kita menyusun dan menggabungkan balok-balok kode disebut?",
        options: ["Stage Screen", "Scripts Area (Workspace)", "Sprite Pane", "Sound Editor"],
        correctAnswer: 1,
        explanation: "Scripts Area atau area lembar kerja adalah tempat utama merangkai balok-balok kode perintah seperti menyusun puzzle."
      },
      {
        question: "Ikon apa yang ditekan untuk memulai eksekusi program di panggung Scratch?",
        options: ["Tombol Segitiga Biru", "Lingkaran Merah", "Bendera Hijau (Green Flag)", "Bintang Emas"],
        correctAnswer: 2,
        explanation: "Bendera Hijau (Green Flag) adalah pemicu standar untuk menjalankan balok 'when green flag clicked'."
      }
    ]
  },
  {
    id: 'koordinat-stage-sprite',
    title: 'Sistem Koordinat Stage (X & Y)',
    icon: 'PlusMinus',
    content: `
# Memahami Sistem Koordinat Panggung Scratch

Di Scratch, panggung tempat karakter bergerak bekerja dengan sistem **Koordinat Kartesius 2 Dimensi (Sumbu X dan Sumbu Y)**. Memahami koordinat adalah kunci utama untuk membuat karakter bergerak lincah dan tepat sasaran!

![Sistem Koordinat Kartesius Stage Scratch](/src/assets/images/scratch_coordinates_1794090375658.jpg)

### Ukuran Layar & Titik Pusat (Origin)
- **Dimensi Total Panggung**: Lebar **480 piksel** dan Tinggi **360 piksel** (rasio 4:3).
- **Titik Pusat (Origin)**: Tepat di titik tengah panggung bernilai \`x: 0, y: 0\`.

---

### Sumbu X dan Sumbu Y

Perhatikan garis biru (horizontal) dan garis hijau (vertikal) pada diagram panduan di atas:

1. **Sumbu X (Garis Horizontal - Kiri ke Kanan)**:
   - Ke arah **Kanan**: Nilai X bernilai **Positif (+)**, maksimal hingga \`+240\`.
   - Ke arah **Kiri**: Nilai X bernilai **Negatif (-)**, minimal hingga \`-240\`.
2. **Sumbu Y (Garis Vertikal - Bawah ke Atas)**:
   - Ke arah **Atas**: Nilai Y bernilai **Positif (+)**, maksimal hingga \`+180\`.
   - Ke arah **Bawah**: Nilai Y bernilai **Negatif (-)**, minimal hingga \`-180\`.

### 4 Kuadran di Stage Scratch

| Kuadran | Posisi di Panggung | Nilai Koordinat | Contoh Letak |
| :--- | :--- | :--- | :--- |
| **Kuadran 1** | Kanan Atas | X Positif (+), Y Positif (+) | \`x: 100, y: 120\` (Langit Kanan) |
| **Kuadran 2** | Kiri Atas | X Negatif (-), Y Positif (+) | \`x: -150, y: 100\` (Langit Kiri) |
| **Kuadran 3** | Kiri Bawah | X Negatif (-), Y Negatif (-) | \`x: -120, y: -100\` (Tanah Kiri) |
| **Kuadran 4** | Kanan Bawah | X Positif (+), Y Negatif (-) | \`x: 180, y: -80\` (Tanah Kanan) |

### Balok Penting Pengatur Posisi Sprite
- \`go to x: [0] y: [0]\`: Memindahkan Sprite seketika (teleportasi) ke koordinat yang dituju.
- \`glide [1] secs to x: [100] y: [50]\`: Membuat Sprite meluncur halus dengan animasi durasi waktu tertentu.
- \`change x by [10]\`: Menggeser Sprite 10 langkah ke arah kanan.
- \`change y by [-10]\`: Menggeser Sprite 10 langkah ke arah bawah (jatuh).

> 💡 **Trik Gravitasi Sederhana**:
> Jika kamu ingin membuat karakter melompat ke atas lalu turun kembali, kamu cukup menambah nilai Y (\`change y by 20\`), beri jeda (\`wait 0.1 secs\`), lalu kurangi nilai Y (\`change y by -20\`)!
    `,
    quiz: [
      {
        question: "Berapakah nilai koordinat tepat di titik pusat (tengah) panggung Scratch?",
        options: ["x: 100, y: 100", "x: 0, y: 0", "x: 240, y: 180", "x: -240, y: -180"],
        correctAnswer: 1,
        explanation: "Titik pusat (origin) panggung Scratch selalu tepat berada pada koordinat x: 0 dan y: 0."
      },
      {
        question: "Jika kamu ingin membuat Sprite bergerak melompat naik ke ATAS panggung, sumbu mana yang nilainya ditambah positif?",
        options: ["Sumbu X", "Sumbu Y", "Sumbu Z", "Sumbu Diagonal"],
        correctAnswer: 1,
        explanation: "Sumbu Y vertikal mengatur posisi atas-bawah. Menambah nilai positif pada sumbu Y (change y by ...) akan menaikkan posisi karakter ke atas."
      },
      {
        question: "Berapakah batas rentang nilai horizontal (Sumbu X) pada panggung pementasan Scratch?",
        options: ["-180 hingga +180", "-240 hingga +240", "0 hingga 100", "-360 hingga +360"],
        correctAnswer: 1,
        explanation: "Sumbu X memiliki rentang dari -240 (ujung paling kiri) sampai +240 (ujung paling kanan), dengan lebar total 480 piksel."
      }
    ]
  },
  {
    id: 'kategori-blok-scratch',
    title: 'Kategori & Ragam Balok Kode',
    icon: 'Layers',
    content: `
# Mengenal Kategori & Ragam Balok Kode Scratch

Setiap balok di Scratch memiliki **warna tematik** dan **bentuk fisik** tersendiri. Sistem visual ini dirancang agar kita bisa langsung mengenali fungsi instruksi hanya dalam satu lirikan mata!

![Ilustrasi Kategori Balok Kode Scratch 3D Puzzle](/src/assets/images/scratch_blocks_1794090375516.jpg)

### Kode Warna Kategori Balok

| Kategori | Warna | Fungsi Utama | Contoh Balok Populer |
| :--- | :--- | :--- | :--- |
| **Motion** | 🔵 Biru | Menggerakkan, mengarahkan, dan memutar Sprite | \`move 10 steps\`, \`turn 15 degrees\`, \`if on edge, bounce\` |
| **Looks** | 🟣 Ungu | Mengubah visual, kostum animasi, dan balon dialog | \`say "Halo!" for 2 secs\`, \`next costume\`, \`change size by 10\` |
| **Sound** | 🔮 Magenta | Memainkan musik, efek bunyi, dan rekaman audio | \`play sound "Meow" until done\`, \`set volume to 100%\` |
| **Events** | 🟡 Kuning Emas | Pemicu awal aksi (*event listener*) dimulainya kode | \`when green flag clicked\`, \`when [space] key pressed\` |
| **Control** | 🟠 Oranye | Alur logika, jeda waktu, perulangan & percabangan | \`wait 1 secs\`, \`repeat 10\`, \`forever\`, \`if ... then\` |
| **Sensing** | 🔷 Biru Muda | Deteksi sentuhan, tombol keyboard, kursor mouse | \`touching mouse-pointer?\`, \`key [space] pressed?\` |
| **Operators** | 🟢 Hijau | Hitungan matematika, perbandingan angka, dan acak | \`pick random 1 to 10\`, \`( ) + ( )\`, \`( ) > ( )\` |
| **Variables** | 🟧 Oranye Tua | Tempat menyimpan data nilai dinamis (Skor, Nyawa) | \`set [Skor] to 0\`, \`change [Skor] by 1\` |

---

### Ragam Bentuk Balok (*Block Shapes*)
1. **Hat Blocks (Balok Bertopi)**: Bagian atasnya berbentuk lengkung cembung. Balok ini selalu diletakkan di baris paling atas sebagai pemicu awal skrip (contoh: *when flag clicked*).
2. **Stack Blocks (Balok Tumpuk)**: Memiliki tonjolan di bawah dan lubang lekukan di atas sehingga dapat disambung berurutan ke bawah.
3. **Boolean Blocks (Balok Logika Runcing)**: Berbentuk heksagonal dengan kedua ujung runcing. Balok ini dimasukkan ke dalam lubang kondisi percabangan dan menghasilkan nilai **True (Benar)** atau **False (Salah)**.
4. **Reporter Blocks (Balok Nilai Lonjong)**: Berbentuk oval lonjong yang mengembalikan nilai teks atau angka variabel (misalnya: *score*, *mouse x*).

> 🧩 **Cara Menyambung Balok**:
> Tarik balok dari Palette ke Scripts Area. Saat didekatkan ke bawah balok lain, bayangan abu-abu penanda kaitan akan muncul. Lepaskan mouse (*drop*), dan balok akan menempel otomatis dengan bunyi klik!
    `,
    quiz: [
      {
        question: "Balok pemicu kejadian seperti 'when [space] key pressed' memiliki warna apa di Scratch?",
        options: ["Biru (Motion)", "Kuning Emas (Events)", "Hijau (Operators)", "Ungu (Looks)"],
        correctAnswer: 1,
        explanation: "Balok Events berwarna kuning keemasan dan bertindak sebagai pemicu (trigger) awal aksi program saat suatu kejadian terjadi."
      },
      {
        question: "Kategori balok mana yang digunakan untuk menampilkan dialog percakapan komik pada karakter?",
        options: ["Looks (Tampilan)", "Sound (Suara)", "Motion (Gerakan)", "Control (Kontrol)"],
        correctAnswer: 0,
        explanation: "Kategori Looks (warna ungu) menyediakan balok 'say ... for 2 seconds' dan 'think ...' untuk menampilkan teks dialog karakter."
      },
      {
        question: "Balok berbentuk heksagonal dengan ujung runcing (Boolean Block) selalu menghasilkan nilai apa?",
        options: ["Angka bulat sembarang", "File gambar latar", "True (Benar) atau False (Salah)", "Suara musik instrumen"],
        correctAnswer: 2,
        explanation: "Balok boolean berfungsi memeriksa kondisi logika dan menghasilkan nilai Benar (True) atau Salah (False)."
      }
    ]
  },
  {
    id: 'logika-loop-dan-percabangan',
    title: 'Logika Loop & Percabangan (If-Then)',
    icon: 'Repeat',
    content: `
# Logika Perulangan (Loop) & Percabangan (If-Then)

Dua pilar terpenting dalam logika berpikir komputasional adalah **Perulangan (Looping)** dan **Percabangan (Conditional Logic)**. Di Scratch, kedua konsep ini direpresentasikan dengan balok berbentuk huruf **C** (*C-shaped blocks*) yang membungkus balok-balok perintah lain di mulutnya.

![Diagram Alur Perulangan Forever dan Percabangan If-Else di Scratch](/src/assets/images/scratch_loops_logic_1794090377114.jpg)

### 1. Logika Perulangan (Looping)

Tanpa perulangan, jika kamu ingin karakter melangkah 100 kali, kamu harus memasang 100 balok \`move 10 steps\`. Dengan balok perulangan, cukup gunakan 1 balok pembungkus:

- \`repeat (10)\`: Menjalankan balok di dalamnya sebanyak angka yang ditentukan (misal 10 kali), lalu program melanjutkan ke balok berikutnya di bawahnya.
- \`forever\`: Menjalankan balok di dalamnya **terus-menerus tanpa henti** selama program berjalan. Sangat penting untuk siklus utama permainan (*game loop*), animasi terus-menerus, atau deteksi sentuhan tiada henti!

---

### 2. Logika Percabangan (Kondisi If-Then & If-Else)

Komputer mengambil keputusan cerdas berdasarkan kondisi: apakah suatu pernyataan bernilai **Benar (True)** atau **Salah (False)**.

Perhatikan skenario pada ilustrasi di atas:
- Karakter anak perempuan sedang berlari di jalur taman.
- Di depannya ada rintangan kerucut oranye.
- **Kondisi**: \`if <touching [Obstacle]?> then\`
  - Jika **BENAR (TRUE)**: Jalankan balok melompat ke atas (\`move up\`) dan ubah warna kostum menjadi hijau!
  - Jika **SALAH (FALSE)**: Lanjutkan langkah lari biasa (\`move 10 steps\`)!

\`\`\`scratch
when green flag clicked
forever
  move 10 steps
  if <touching [Rintangan]?> then
    start sound [Jump]
    change y by 50
    wait 0.2 secs
    change y by -50
  end
  if on edge, bounce
\`\`\`

> 💡 **Fitur Istimewa: "If on edge, bounce"**:
> Balok Motion ini memastikan Sprite yang menabrak pinggiran panggung tidak akan keluar layar dan lenyap, melainkan memantul kembali ke dalam arena permainan!
    `,
    quiz: [
      {
        question: "Balok loop mana yang digunakan jika ingin suatu animasi atau game berjalan terus-menerus tanpa batas henti?",
        options: ["repeat 10", "forever", "wait 1 secs", "stop all"],
        correctAnswer: 1,
        explanation: "Balok 'forever' (selamanya) mengeksekusi instruksi di dalamnya tanpa henti hingga tombol stop merah ditekan atau kondisi game over terjadi."
      },
      {
        question: "Bagian kode yang hanya akan dijalankan JIKA suatu syarat kondisi bernilai Benar (True) adalah?",
        options: ["if ... then", "wait until", "repeat until", "when I receive"],
        correctAnswer: 0,
        explanation: "Balok 'if ... then' memeriksa kondisi; jika kondisi True maka instruksi di dalam mulut balok akan dieksekusi."
      },
      {
        question: "Balok Motion manakah yang berguna mencegah karakter berjalan menembus dan menghilang di luar layar panggung?",
        options: ["set rotation style", "point in direction 90", "if on edge, bounce", "glide 1 secs to random position"],
        correctAnswer: 2,
        explanation: "'if on edge, bounce' akan otomatis memantulkan karakter jika koordinatnya menyentuh tepi batas panggung."
      }
    ]
  },
  {
    id: 'proyek-game-catch',
    title: 'Proyek Game: Menangkap Bintang (Catch Game)',
    icon: 'Sparkles',
    content: `
# Proyek Mandiri: Membuat Game "Star Catcher" di Scratch

Saatnya mempraktikkan seluruh pemahaman yang telah kita pelajari! Kita akan membuat proyek video game interaktif: **Kucing Penangkap Bintang (Star Catcher)**.

![Proyek Game Star Catcher Lengkap dengan Skor dan Nyawa](/src/assets/images/scratch_game_project_1794090376798.jpg)

### Aturan Permainan (*Game Mechanics*)
1. Pemain mengendalikan **Kucing Scratch** di bagian bawah panggung secara horizontal.
2. **Bintang Emas** dan apel berjatuhan dari atas langit panggung pada koordinat horizontal acak.
3. Setiap kali Kucing berhasil menangkap bintang:
   - Skor bertambah **+10 poin**.
   - Efek suara gemerincing berbunyi (*Magic collect sound*).
4. Jika bintang jatuh menyentuh batas bawah tanah tanpa tertangkap:
   - Nyawa pemain berkurang **-1**.
5. Permainan berakhir (*Game Over*) ketika nyawa habis menjadi 0!

---

### Langkah Pembuatan Game

#### 1. Persiapan Sprite & Variabel
- Pilih Sprite **Kucing (Cat)** dan Sprite **Bintang (Star)**.
- Buat 2 Variabel di kategori Variables: \`Skor\` dan \`Nyawa\`.

#### 2. Skrip Kendali Kucing (Player Movement)
Pasang skrip ini pada Sprite Kucing:
\`\`\`scratch
when green flag clicked
set [Skor] to 0
set [Nyawa] to 3
go to x: 0 y: -120
forever
  set x to (mouse x)
\`\`\`
*Penjelasan: Kucing akan selalu mengikuti posisi horizontal kursor mouse pemain ke kiri dan kanan dengan sangat halus dan responsif.*

#### 3. Skrip Bintang Berjatuhan (Falling Object Logic)
Pasang skrip ini pada Sprite Bintang:
\`\`\`scratch
when green flag clicked
forever
  go to x: (pick random -200 to 200) y: 160
  repeat until <(y position) < -150>
    change y by -6
    if <touching [Cat]?> then
      start sound [Magic]
      change [Skor] by 10
      go to x: (pick random -200 to 200) y: 160
    end
  end
  // Jika bintang menyentuh tanah di bawah:
  change [Nyawa] by -1
  if <(Nyawa) = 0> then
    say "GAME OVER!" for 2 secs
    stop [all]
  end
\`\`\`

> 🏆 **Tantangan Modifikasi Mandiri**:
> Coba tambahkan kecepatan jatuh bintang yang semakin lama semakin bertambah cepat saat skor pemain menembus angka 100 poin!
    `,
    quiz: [
      {
        question: "Balok Operators apa yang digunakan untuk membuat posisi awal bintang muncul secara acak di langit panggung?",
        options: ["pick random -200 to 200", "round", "length of", "join"],
        correctAnswer: 0,
        explanation: "Balok 'pick random' menghasilkan bilangan acak dalam rentang yang ditentukan, sehingga bintang muncul di titik horizontal yang berbeda tiap kali jatuh."
      },
      {
        question: "Perintah apa yang digunakan untuk menghentikan seluruh aktivitas skrip dan game ketika Nyawa habis?",
        options: ["hide", "stop [all]", "delete this clone", "wait 1 secs"],
        correctAnswer: 1,
        explanation: "Balok 'stop [all]' di kategori Control akan menghentikan seluruh skrip pada semua Sprite sekaligus saat kondisi Game Over tercapai."
      },
      {
        question: "Untuk membuat karakter pemain bergerak mengikuti posisi kursor mouse secara mendatar/horizontal, kita menggunakan:",
        options: ["set y to (mouse y)", "set x to (mouse x)", "move 10 steps", "turn 180 degrees"],
        correctAnswer: 1,
        explanation: "'set x to (mouse x)' menetapkan koordinat horizontal Sprite sesuai posisi mendatar kursor mouse pengguna."
      }
    ]
  }
];

export const COURSES = [
  {
    id: 'scratch',
    title: 'Pemrograman Visual Scratch',
    description: 'Belajar logika pemrograman, sistem koordinat panggung, animasi, dan kreasi game seru dengan balok visual Scratch.',
    level: 'Beginner',
    topics: SCRATCH_TOPICS
  },
  {
    id: 'berpikir-komputasi',
    title: 'Berpikir Komputasi',
    description: 'Pelajari metode berpikir sistematis untuk memecahkan masalah dari dasar hingga mahir.',
    level: 'Beginner',
    topics: BERPIKIR_KOMPUTASI_TOPICS
  },
  {
    id: 'tik',
    title: 'Teknologi Informasi dan Komunikasi',
    description: 'Mempelajari integrasi aplikasi perkantoran, pembuatan blog, dan pengembangan vlog.',
    level: 'Beginner',
    topics: TEKNOLOGI_INFORMASI_KOMPUTASI_TOPICS
  },
  {
    id: 'algoritma-smp',
    title: 'Algoritma (SMP)',
    description: 'Belajar dasar-dasar logika dan aliran program untuk tingkat SMP.',
    level: 'Beginner',
    topics: ALGORITMA_SMP_TOPICS
  },
  {
    id: 'html-dasar',
    title: 'HTML Dasar',
    description: 'Belajar struktur dasar halaman web menggunakan HTML.',
    level: 'Beginner',
    topics: HTML_DASAR_TOPICS
  },
  {
    id: 'php-dasar',
    title: 'PHP Dasar',
    description: 'Belajar konsep fundamental PHP dari awal untuk pemula.',
    level: 'Beginner',
    topics: PHP_DASAR_TOPICS
  },
  {
    id: 'php',
    title: 'PHP (Lanjutan)',
    description: 'Memperdalam PHP dengan konsep OOP, MVC, dan lainnya.',
    level: 'Intermediate',
    topics: PHP_TOPICS
  }
];
