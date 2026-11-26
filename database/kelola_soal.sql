-- Skema Database MySQL (phpMyAdmin) Khusus Penyimpanan Kelola Soal
-- Tabel ini juga dibuat otomatis oleh server saat pertama kali terhubung.

CREATE TABLE IF NOT EXISTS `soal_sets` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `kelas` VARCHAR(100) NOT NULL DEFAULT 'Semua Kelas',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_full_screen` TINYINT(1) NOT NULL DEFAULT 0,
  `is_score_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `timer_mode` VARCHAR(32) NOT NULL DEFAULT 'per_judul',
  `title_timer_seconds` INT NOT NULL DEFAULT 900,
  `default_question_timer_seconds` INT NOT NULL DEFAULT 30,
  `shuffle_questions` TINYINT(1) NOT NULL DEFAULT 0,
  `passing_score` INT NULL,
  `created_at` VARCHAR(40) NOT NULL,
  `updated_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_soal_sets_active` (`is_active`),
  INDEX `idx_soal_sets_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `soal_questions` (
  `id` VARCHAR(100) NOT NULL,
  `set_id` VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `question_text` LONGTEXT NOT NULL,
  `question_image` LONGTEXT NULL,
  `options_json` LONGTEXT NOT NULL,
  `correct_answer` TINYINT NOT NULL DEFAULT 0,
  `timer_seconds` INT NOT NULL DEFAULT 30,
  `explanation` LONGTEXT NULL,
  `points` INT NULL,
  `created_at` VARCHAR(40) NOT NULL,
  `updated_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_soal_questions_set_order` (`set_id`, `sort_order`),
  CONSTRAINT `fk_soal_questions_set`
    FOREIGN KEY (`set_id`) REFERENCES `soal_sets` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `soal_admin_config` (
  `config_key` VARCHAR(100) NOT NULL,
  `config_value` TEXT NOT NULL,
  `updated_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
