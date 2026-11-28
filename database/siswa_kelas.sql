-- Skema Database MySQL (nesj8697_digilab) untuk Data Siswa & Kelas
-- Jalankan SQL ini di phpMyAdmin database `nesj8697_digilab`,
-- atau biarkan API server/PHP Bridge membuatnya secara otomatis saat terhubung.

CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(120) NOT NULL,
  `nama_kelas` VARCHAR(100) NOT NULL,
  `tahun_pelajaran` VARCHAR(32) NOT NULL DEFAULT '2025/2026',
  `created_at` VARCHAR(40) NOT NULL,
  `updated_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_classes_nama_ta` (`nama_kelas`, `tahun_pelajaran`),
  INDEX `idx_classes_tahun` (`tahun_pelajaran`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(120) NOT NULL,
  `nis` VARCHAR(64) NOT NULL DEFAULT '',
  `nama` VARCHAR(255) NOT NULL,
  `jenis_kelamin` VARCHAR(16) NOT NULL DEFAULT 'L',
  `kelas` VARCHAR(100) NOT NULL,
  `class_id` VARCHAR(120) NULL,
  `tahun_pelajaran` VARCHAR(32) NOT NULL DEFAULT '2025/2026',
  `avatar_url` LONGTEXT NULL,
  `created_at` VARCHAR(40) NOT NULL,
  `updated_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_students_nis_ta` (`nis`, `tahun_pelajaran`),
  INDEX `idx_students_kelas_ta` (`kelas`, `tahun_pelajaran`),
  INDEX `idx_students_class_id` (`class_id`),
  CONSTRAINT `fk_students_class`
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
