<?php
/**
 * Konfigurasi Database MySQL untuk Jembatan API Kelola Soal (cPanel / phpMyAdmin)
 *
 * Cara pakai di cPanel File Manager:
 * 1. Unggah file ini dan `soal_api.php` ke folder website Anda (misal `public_html/api-soal/`).
 * 2. Ubah nama file ini dari `soal_config.example.php` menjadi `soal_config.php`.
 * 3. Isi detail database dari menu "Manage My Databases" di cPanel dan buat API Key rahasia sendiri.
 */

return [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'NAMA_DATABASE_CPANEL_ANDA',
    'username' => 'USERNAME_DATABASE_CPANEL_ANDA',
    'password' => 'PASSWORD_DATABASE_CPANEL_ANDA',
    // Buat kunci acak panjang (misal 32+ karakter), lalu samakan dengan PHP_SOAL_API_KEY di Vercel/Secrets
    'api_key' => 'GANTI_DENGAN_API_KEY_RAHASIA_ANDA',
];
