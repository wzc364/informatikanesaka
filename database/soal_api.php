<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configPath = __DIR__ . '/soal_config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'File soal_config.php belum ditemukan di folder yang sama dengan soal_api.php.'
    ]);
    exit;
}

$cfg = require $configPath;
if (!is_array($cfg)) {
    http_response_code(500);
    echo json_encode(['error' => 'Format soal_config.php tidak valid.']);
    exit;
}

$expectedKey = trim((string)($cfg['api_key'] ?? ''));
$providedKey = '';
if (isset($_SERVER['HTTP_X_API_KEY'])) {
    $providedKey = trim((string)$_SERVER['HTTP_X_API_KEY']);
} elseif (function_exists('getallheaders')) {
    $headers = getallheaders();
    foreach ($headers as $k => $v) {
        if (strtolower((string)$k) === 'x-api-key') {
            $providedKey = trim((string)$v);
            break;
        }
    }
}

if ($expectedKey === '' || $expectedKey === 'GANTI_DENGAN_API_KEY_RAHASIA_ANDA' || $providedKey === '' || !hash_equals($expectedKey, $providedKey)) {
    http_response_code(401);
    echo json_encode(['error' => 'Akses ditolak: X-Api-Key tidak valid.']);
    exit;
}

try {
    $host = (string)($cfg['host'] ?? 'localhost');
    $port = (int)($cfg['port'] ?? 3306);
    $dbname = (string)($cfg['database'] ?? '');
    $user = (string)($cfg['username'] ?? '');
    $pass = (string)($cfg['password'] ?? '');

    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Koneksi PHP ke MySQL lokal gagal. Periksa soal_config.php.']);
    exit;
}

function ensureTables(PDO $pdo): void {
    $pdo->exec("
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
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
            INDEX `idx_soal_questions_set_order` (`set_id`, `sort_order`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `soal_admin_config` (
            `config_key` VARCHAR(100) NOT NULL,
            `config_value` TEXT NOT NULL,
            `updated_at` VARCHAR(40) NOT NULL,
            PRIMARY KEY (`config_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

function generateId(string $prefix = 'soal'): string {
    return $prefix . '_' . bin2hex(random_bytes(8));
}

function nowIso(): string {
    return gmdate('Y-m-d\TH:i:s.000\Z');
}

function normalizeOptions($raw): array {
    if (is_string($raw)) {
        $decoded = json_decode($raw, true);
        $raw = is_array($decoded) ? $decoded : [];
    }
    $arr = is_array($raw) ? $raw : [];
    $out = [];
    for ($i = 0; $i < 4; $i++) {
        $item = isset($arr[$i]) && is_array($arr[$i]) ? $arr[$i] : [];
        $text = trim((string)($item['text'] ?? ''));
        $image = trim((string)($item['image'] ?? ''));
        $opt = ['text' => $text];
        if ($image !== '') {
            $opt['image'] = $image;
        }
        $out[] = $opt;
    }
    return $out;
}

function mapSetRow(array $row): array {
    $res = [
        'id' => (string)$row['id'],
        'title' => (string)($row['title'] ?? ''),
        'description' => (string)($row['description'] ?? ''),
        'kelas' => (string)($row['kelas'] ?? 'Semua Kelas'),
        'isActive' => ((int)($row['is_active'] ?? 1)) === 1,
        'isFullScreen' => ((int)($row['is_full_screen'] ?? 0)) === 1,
        'isScoreVisible' => ((int)($row['is_score_visible'] ?? 1)) === 1,
        'timerMode' => ($row['timer_mode'] ?? '') === 'per_soal' ? 'per_soal' : 'per_judul',
        'titleTimerSeconds' => (int)($row['title_timer_seconds'] ?? 900),
        'defaultQuestionTimerSeconds' => (int)($row['default_question_timer_seconds'] ?? 30),
        'shuffleQuestions' => ((int)($row['shuffle_questions'] ?? 0)) === 1,
        'createdAt' => (string)($row['created_at'] ?? ''),
        'updatedAt' => (string)($row['updated_at'] ?? ''),
    ];
    if ($row['passing_score'] !== null) {
        $res['passingScore'] = (int)$row['passing_score'];
    }
    return $res;
}

function mapQuestionRow(array $row): array {
    $res = [
        'id' => (string)$row['id'],
        'setId' => (string)$row['set_id'],
        'order' => (int)($row['sort_order'] ?? 0),
        'isActive' => ((int)($row['is_active'] ?? 1)) === 1,
        'questionText' => (string)($row['question_text'] ?? ''),
        'options' => normalizeOptions($row['options_json'] ?? '[]'),
        'correctAnswer' => max(0, min(3, (int)($row['correct_answer'] ?? 0))),
        'timerSeconds' => (int)($row['timer_seconds'] ?? 30),
        'createdAt' => (string)($row['created_at'] ?? ''),
        'updatedAt' => (string)($row['updated_at'] ?? ''),
    ];
    if (!empty($row['question_image'])) {
        $res['questionImage'] = (string)$row['question_image'];
    }
    if (!empty($row['explanation'])) {
        $res['explanation'] = (string)$row['explanation'];
    }
    if ($row['points'] !== null) {
        $res['points'] = (int)$row['points'];
    }
    return $res;
}

function seedDefaultOnce(PDO $pdo): void {
    $stmt = $pdo->prepare('SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1');
    $stmt->execute(['seeded_pola_bilangan']);
    if ($stmt->fetch()) {
        return;
    }

    $count = (int)$pdo->query('SELECT COUNT(*) FROM soal_sets')->fetchColumn();
    $now = nowIso();
    if ($count === 0) {
        $defaultQuestions = [
            ['pb-q1', 'Suku ke-n dari barisan aritmetika 3, 7, 11, 15, ... adalah...', [['text' => '4n - 1'], ['text' => '4n + 1'], ['text' => '3n + 4'], ['text' => '4n + 3']], 0, 'Suku pertama a = 3, beda b = 4. Un = a + (n-1)b = 3 + 4n - 4 = 4n - 1.', 0],
            ['pb-q2', 'Diketahui barisan aritmetika 5, 8, 11, 14, ... Suku ke-10 dari barisan tersebut adalah...', [['text' => '29'], ['text' => '32'], ['text' => '35'], ['text' => '38']], 1, 'a = 5, b = 3. U10 = a + 9b = 5 + 9(3) = 5 + 27 = 32.', 1],
            ['pb-q3', 'Rumus suku ke-n untuk barisan geometri 2, 6, 18, 54, ... adalah...', [['text' => '2 × 3ⁿ'], ['text' => '3 × 2ⁿ⁻¹'], ['text' => '2 × 3ⁿ⁻¹'], ['text' => '6ⁿ⁻¹']], 2, 'Suku pertama a = 2, rasio r = 3. Un = a × rⁿ⁻¹ = 2 × 3ⁿ⁻¹.', 2],
            ['pb-q4', 'Suku ke-6 dari barisan geometri 1, 2, 4, 8, ... adalah...', [['text' => '16'], ['text' => '32'], ['text' => '64'], ['text' => '128']], 1, 'a = 1, r = 2. U6 = a × r⁵ = 1 × 2⁵ = 32.', 3],
            ['pb-q5', 'Diketahui deret aritmetika 2 + 5 + 8 + 11 + ... Jumlah 10 suku pertama adalah...', [['text' => '145'], ['text' => '150'], ['text' => '155'], ['text' => '160']], 2, 'a = 2, b = 3, n = 10. Sn = n/2 (2a + (n-1)b) = 10/2 (4 + 9(3)) = 5 (31) = 155.', 4],
            ['pb-q6', 'Suatu barisan aritmetika memiliki suku ke-4 = 14 dan suku ke-9 = 29. Suku ke-15 adalah...', [['text' => '41'], ['text' => '44'], ['text' => '47'], ['text' => '50']], 2, 'U9 - U4 = 5b => 29 - 14 = 15 => b = 3. U4 = a + 3b = 14 => a = 5. U15 = 5 + 14(3) = 47.', 5],
            ['pb-q7', 'Rasio dari barisan geometri 64, 32, 16, 8, ... adalah...', [['text' => '2'], ['text' => '1/2'], ['text' => '-2'], ['text' => '1/4']], 1, 'Rasio r = U2 / U1 = 32 / 64 = 1/2.', 6],
            ['pb-q8', 'Tiga suku berikutnya dari barisan bilangan 1, 3, 6, 10, 15, ... adalah...', [['text' => '18, 22, 27'], ['text' => '21, 28, 36'], ['text' => '20, 26, 33'], ['text' => '21, 27, 34']], 1, 'Ini barisan bilangan segitiga (+2, +3, +4, +5, +6, +7, +8). Suku berikutnya: 15+6=21, 21+7=28, 28+8=36.', 7],
            ['pb-q9', 'Suku ke-8 dari barisan geometri 3, 6, 12, 24, ... adalah...', [['text' => '192'], ['text' => '384'], ['text' => '768'], ['text' => '1536']], 1, 'a = 3, r = 2. U8 = 3 × 2⁷ = 3 × 128 = 384.', 8],
            ['pb-q10', 'Jika suku pertama barisan aritmetika adalah 7 dan bedanya 4, maka suku ke-20 adalah...', [['text' => '79'], ['text' => '83'], ['text' => '87'], ['text' => '91']], 1, 'a = 7, b = 4. U20 = 7 + 19(4) = 7 + 76 = 83.', 9],
            ['pb-q11', 'Amuba membelah diri menjadi 2 setiap 20 menit. Jika mula-mula ada 5 amuba, banyak amuba setelah 2 jam adalah...', [['text' => '160'], ['text' => '320'], ['text' => '640'], ['text' => '1280']], 1, '2 jam = 120 menit. Banyak pembelahan = 120 / 20 = 6 kali. U7 = 5 × 2⁶ = 5 × 64 = 320.', 10],
            ['pb-q12', 'Diketahui barisan bilangan kuadrat 1, 4, 9, 16, 25, ... Suku ke-13 barisan tersebut adalah...', [['text' => '144'], ['text' => '169'], ['text' => '196'], ['text' => '225']], 1, 'Rumus suku ke-n adalah Un = n². U13 = 13² = 169.', 11],
            ['pb-q13', 'Jumlah 6 suku pertama dari barisan geometri 3, 6, 12, 24, ... adalah...', [['text' => '93'], ['text' => '189'], ['text' => '378'], ['text' => '765']], 1, 'a = 3, r = 2. S6 = a(r⁶ - 1)/(r - 1) = 3(64 - 1)/(2 - 1) = 3(63) = 189.', 12],
            ['pb-q14', 'Suku kelima barisan aritmetika adalah 21 dan suku kesepuluh adalah 41. Beda barisan tersebut adalah...', [['text' => '3'], ['text' => '4'], ['text' => '5'], ['text' => '6']], 1, 'U10 - U5 = 5b => 41 - 21 = 20 => b = 4.', 13],
            ['pb-q15', 'Seutas tali dipotong menjadi 5 bagian membentuk barisan geometri. Jika potongan terpendek 3 cm dan terpanjang 768 cm, panjang tali semula adalah...', [['text' => '771 cm'], ['text' => '1023 cm'], ['text' => '1536 cm'], ['text' => '3069 cm']], 1, 'a = 3, U5 = 3r⁴ = 768 => r⁴ = 256 => r = 4. S5 = 3(1024 - 1)/3 = 1023 cm.', 14],
            ['pb-q16', 'Suku ke-n suatu barisan ditentukan oleh Un = 3n² - 2. Suku ke-7 dari barisan tersebut adalah...', [['text' => '145'], ['text' => '147'], ['text' => '150'], ['text' => '142']], 0, 'U7 = 3(7)² - 2 = 3(49) - 2 = 147 - 2 = 145.', 15],
            ['pb-q17', 'Suku ke-15 dari barisan aritmetika 50, 45, 40, 35, ... adalah...', [['text' => '-15'], ['text' => '-20'], ['text' => '-25'], ['text' => '20']], 1, 'a = 50, b = -5. U15 = 50 + 14(-5) = 50 - 70 = -20.', 16],
            ['pb-q18', 'Suatu gedung pertunjukan memiliki 15 baris kursi. Baris pertama berisi 20 kursi, baris kedua 24 kursi, baris ketiga 28 kursi, dan seterusnya. Jumlah seluruh kursi adalah...', [['text' => '680'], ['text' => '700'], ['text' => '720'], ['text' => '750']], 2, 'a = 20, b = 4, n = 15. S15 = 15/2 (40 + 56) = 7.5 (96) = 720.', 17],
            ['pb-q19', 'Suku tengah dari barisan aritmetika 3, 7, 11, ..., 99 adalah...', [['text' => '49'], ['text' => '51'], ['text' => '53'], ['text' => '55']], 1, 'Ut = (a + Un) / 2 = (3 + 99) / 2 = 102 / 2 = 51.', 18],
            ['pb-q20', 'Diketahui barisan geometri dengan U2 = 6 dan U5 = 162. Suku ke-4 dari barisan tersebut adalah...', [['text' => '18'], ['text' => '36'], ['text' => '54'], ['text' => '108']], 2, 'U5 / U2 = r³ = 162 / 6 = 27 => r = 3. U2 = 2a = 6 => a = 2. U4 = 2 × 3³ = 54.', 19],
        ];

        $pdo->beginTransaction();
        try {
            $insSet = $pdo->prepare(
                'INSERT INTO soal_sets (id, title, description, kelas, is_active, is_full_screen, is_score_visible, timer_mode, title_timer_seconds, default_question_timer_seconds, shuffle_questions, passing_score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $insSet->execute([
                'pola-bilangan-20-soal',
                'Ujian Pola Bilangan Aritmetika & Geometri',
                '20 soal pilihan ganda tentang barisan dan deret aritmetika serta geometri. Skor 5 poin per soal, waktu pengerjaan 40 menit.',
                'Semua Kelas',
                1,
                1,
                1,
                'per_judul',
                2400,
                120,
                0,
                75,
                $now,
                $now,
            ]);

            $insQ = $pdo->prepare(
                'INSERT INTO soal_questions (id, set_id, sort_order, is_active, question_text, question_image, options_json, correct_answer, timer_seconds, explanation, points, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            foreach ($defaultQuestions as $dq) {
                $insQ->execute([
                    $dq[0],
                    'pola-bilangan-20-soal',
                    $dq[5],
                    1,
                    $dq[1],
                    '',
                    json_encode($dq[2], JSON_UNESCAPED_UNICODE),
                    $dq[3],
                    120,
                    $dq[4],
                    5,
                    $now,
                    $now,
                ]);
            }

            $pdo->prepare('INSERT IGNORE INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?)')
                ->execute(['seeded_pola_bilangan', '1', $now]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    } else {
        $pdo->prepare('INSERT IGNORE INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?)')
            ->execute(['seeded_pola_bilangan', '1', $now]);
    }
}

try {
    ensureTables($pdo);
    seedDefaultOnce($pdo);

    $rawBody = file_get_contents('php://input');
    $body = $rawBody ? json_decode($rawBody, true) : [];
    if (!is_array($body)) {
        $body = [];
    }
    $action = (string)($body['action'] ?? ($_GET['action'] ?? 'list'));
    $now = nowIso();

    switch ($action) {
        case 'health': {
            $pdo->query('SELECT 1');
            echo json_encode(['configured' => true, 'connected' => true]);
            break;
        }

        case 'list': {
            $sets = array_map(
                'mapSetRow',
                $pdo->query('SELECT * FROM soal_sets ORDER BY updated_at DESC, created_at DESC')->fetchAll()
            );
            $questions = array_map(
                'mapQuestionRow',
                $pdo->query('SELECT * FROM soal_questions ORDER BY sort_order ASC, created_at ASC')->fetchAll()
            );
            echo json_encode([
                'configured' => true,
                'sets' => $sets,
                'questions' => $questions,
            ], JSON_UNESCAPED_UNICODE);
            break;
        }

        case 'create_set': {
            $title = trim((string)($body['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Judul kartu soal wajib diisi.']);
                break;
            }
            $id = trim((string)($body['id'] ?? '')) ?: generateId('set');
            $stmt = $pdo->prepare(
                'INSERT INTO soal_sets (id, title, description, kelas, is_active, is_full_screen, is_score_visible, timer_mode, title_timer_seconds, default_question_timer_seconds, shuffle_questions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $id,
                $title,
                trim((string)($body['description'] ?? '')),
                trim((string)($body['kelas'] ?? '')) ?: 'Semua Kelas',
                array_key_exists('isActive', $body) ? ($body['isActive'] ? 1 : 0) : 1,
                !empty($body['isFullScreen']) ? 1 : 0,
                array_key_exists('isScoreVisible', $body) ? ($body['isScoreVisible'] ? 1 : 0) : 1,
                ($body['timerMode'] ?? '') === 'per_soal' ? 'per_soal' : 'per_judul',
                max(0, (int)($body['titleTimerSeconds'] ?? 900)),
                max(5, (int)($body['defaultQuestionTimerSeconds'] ?? 30)),
                !empty($body['shuffleQuestions']) ? 1 : 0,
                $now,
                $now,
            ]);
            $q = $pdo->prepare('SELECT * FROM soal_sets WHERE id = ? LIMIT 1');
            $q->execute([$id]);
            http_response_code(201);
            echo json_encode(['set' => mapSetRow($q->fetch())], JSON_UNESCAPED_UNICODE);
            break;
        }

        case 'update_set': {
            $setId = trim((string)($body['id'] ?? ''));
            $q = $pdo->prepare('SELECT * FROM soal_sets WHERE id = ? LIMIT 1');
            $q->execute([$setId]);
            $row = $q->fetch();
            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Kartu soal tidak ditemukan.']);
                break;
            }
            $existing = mapSetRow($row);
            $title = array_key_exists('title', $body) ? trim((string)$body['title']) : $existing['title'];
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Judul kartu soal tidak boleh kosong.']);
                break;
            }
            $stmt = $pdo->prepare(
                'UPDATE soal_sets SET title = ?, description = ?, kelas = ?, is_active = ?, is_full_screen = ?, is_score_visible = ?, timer_mode = ?, title_timer_seconds = ?, default_question_timer_seconds = ?, shuffle_questions = ?, updated_at = ? WHERE id = ?'
            );
            $stmt->execute([
                $title,
                array_key_exists('description', $body) ? trim((string)$body['description']) : $existing['description'],
                array_key_exists('kelas', $body) ? (trim((string)$body['kelas']) ?: 'Semua Kelas') : $existing['kelas'],
                array_key_exists('isActive', $body) ? ($body['isActive'] ? 1 : 0) : ($existing['isActive'] ? 1 : 0),
                array_key_exists('isFullScreen', $body) ? ($body['isFullScreen'] ? 1 : 0) : ($existing['isFullScreen'] ? 1 : 0),
                array_key_exists('isScoreVisible', $body) ? ($body['isScoreVisible'] ? 1 : 0) : ($existing['isScoreVisible'] ? 1 : 0),
                array_key_exists('timerMode', $body) ? ($body['timerMode'] === 'per_soal' ? 'per_soal' : 'per_judul') : $existing['timerMode'],
                array_key_exists('titleTimerSeconds', $body) ? max(0, (int)$body['titleTimerSeconds']) : $existing['titleTimerSeconds'],
                array_key_exists('defaultQuestionTimerSeconds', $body) ? max(5, (int)$body['defaultQuestionTimerSeconds']) : $existing['defaultQuestionTimerSeconds'],
                array_key_exists('shuffleQuestions', $body) ? ($body['shuffleQuestions'] ? 1 : 0) : ($existing['shuffleQuestions'] ? 1 : 0),
                $now,
                $setId,
            ]);
            $q->execute([$setId]);
            echo json_encode(['set' => mapSetRow($q->fetch())], JSON_UNESCAPED_UNICODE);
            break;
        }

        case 'delete_set': {
            $setId = trim((string)($body['id'] ?? ''));
            $pdo->beginTransaction();
            try {
                $pdo->prepare('DELETE FROM soal_questions WHERE set_id = ?')->execute([$setId]);
                $pdo->prepare('DELETE FROM soal_sets WHERE id = ?')->execute([$setId]);
                $pdo->commit();
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw $e;
            }
            echo json_encode(['ok' => true]);
            break;
        }

        case 'toggle_all_questions': {
            $setId = trim((string)($body['setId'] ?? ''));
            $activate = !empty($body['activate']) ? 1 : 0;
            if ($setId === '') {
                http_response_code(400);
                echo json_encode(['error' => 'setId wajib diisi.']);
                break;
            }
            $pdo->prepare('UPDATE soal_questions SET is_active = ?, updated_at = ? WHERE set_id = ?')
                ->execute([$activate, $now, $setId]);
            $pdo->prepare('UPDATE soal_sets SET updated_at = ? WHERE id = ?')->execute([$now, $setId]);
            echo json_encode(['ok' => true]);
            break;
        }

        case 'bulk_questions': {
            $rawQuestions = isset($body['questions']) && is_array($body['questions']) ? $body['questions'] : [];
            if (count($rawQuestions) === 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Daftar soal tidak boleh kosong.']);
                break;
            }
            $pdo->beginTransaction();
            try {
                $targetSetId = trim((string)($body['setId'] ?? ''));
                if (isset($body['newSet']) && is_array($body['newSet'])) {
                    $ns = $body['newSet'];
                    $title = trim((string)($ns['title'] ?? ''));
                    if ($title === '') {
                        $pdo->rollBack();
                        http_response_code(400);
                        echo json_encode(['error' => 'Judul kartu soal baru wajib diisi.']);
                        break;
                    }
                    $targetSetId = trim((string)($ns['id'] ?? '')) ?: generateId('set');
                    $pdo->prepare(
                        'INSERT INTO soal_sets (id, title, description, kelas, is_active, is_full_screen, is_score_visible, timer_mode, title_timer_seconds, default_question_timer_seconds, shuffle_questions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                    )->execute([
                        $targetSetId,
                        $title,
                        trim((string)($ns['description'] ?? '')),
                        trim((string)($ns['kelas'] ?? '')) ?: 'Semua Kelas',
                        array_key_exists('isActive', $ns) ? ($ns['isActive'] ? 1 : 0) : 1,
                        !empty($ns['isFullScreen']) ? 1 : 0,
                        array_key_exists('isScoreVisible', $ns) ? ($ns['isScoreVisible'] ? 1 : 0) : 1,
                        ($ns['timerMode'] ?? '') === 'per_soal' ? 'per_soal' : 'per_judul',
                        max(0, (int)($ns['titleTimerSeconds'] ?? 900)),
                        max(5, (int)($ns['defaultQuestionTimerSeconds'] ?? 30)),
                        !empty($ns['shuffleQuestions']) ? 1 : 0,
                        $now,
                        $now,
                    ]);
                }

                if ($targetSetId === '') {
                    $pdo->rollBack();
                    http_response_code(400);
                    echo json_encode(['error' => 'Kartu soal tujuan (setId) wajib diisi.']);
                    break;
                }

                $maxStmt = $pdo->prepare('SELECT COALESCE(MAX(sort_order), 0) FROM soal_questions WHERE set_id = ?');
                $maxStmt->execute([$targetSetId]);
                $nextOrder = (int)$maxStmt->fetchColumn();

                $insQ = $pdo->prepare(
                    'INSERT INTO soal_questions (id, set_id, sort_order, is_active, question_text, question_image, options_json, correct_answer, timer_seconds, explanation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                foreach ($rawQuestions as $item) {
                    $nextOrder++;
                    $qId = trim((string)($item['id'] ?? '')) ?: generateId('q');
                    $insQ->execute([
                        $qId,
                        $targetSetId,
                        isset($item['order']) ? (int)$item['order'] : $nextOrder,
                        array_key_exists('isActive', $item) ? ($item['isActive'] ? 1 : 0) : 1,
                        trim((string)($item['questionText'] ?? '')),
                        trim((string)($item['questionImage'] ?? '')),
                        json_encode(normalizeOptions($item['options'] ?? []), JSON_UNESCAPED_UNICODE),
                        max(0, min(3, (int)($item['correctAnswer'] ?? 0))),
                        max(0, (int)($item['timerSeconds'] ?? 30)),
                        trim((string)($item['explanation'] ?? '')),
                        $now,
                        $now,
                    ]);
                }

                $pdo->prepare('UPDATE soal_sets SET updated_at = ? WHERE id = ?')->execute([$now, $targetSetId]);
                $pdo->commit();
                http_response_code(201);
                echo json_encode(['ok' => true, 'setId' => $targetSetId, 'count' => count($rawQuestions)]);
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw $e;
            }
            break;
        }

        case 'create_question': {
            $setId = trim((string)($body['setId'] ?? ''));
            $qText = trim((string)($body['questionText'] ?? ''));
            $qImg = trim((string)($body['questionImage'] ?? ''));
            if ($setId === '' || ($qText === '' && $qImg === '')) {
                http_response_code(400);
                echo json_encode(['error' => 'setId dan teks/gambar pertanyaan wajib diisi.']);
                break;
            }
            $maxStmt = $pdo->prepare('SELECT COALESCE(MAX(sort_order), 0) FROM soal_questions WHERE set_id = ?');
            $maxStmt->execute([$setId]);
            $nextOrder = isset($body['order']) ? (int)$body['order'] : ((int)$maxStmt->fetchColumn() + 1);
            $qId = trim((string)($body['id'] ?? '')) ?: generateId('q');

            $pdo->prepare(
                'INSERT INTO soal_questions (id, set_id, sort_order, is_active, question_text, question_image, options_json, correct_answer, timer_seconds, explanation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                $qId,
                $setId,
                $nextOrder,
                array_key_exists('isActive', $body) ? ($body['isActive'] ? 1 : 0) : 1,
                $qText,
                $qImg,
                json_encode(normalizeOptions($body['options'] ?? []), JSON_UNESCAPED_UNICODE),
                max(0, min(3, (int)($body['correctAnswer'] ?? 0))),
                max(0, (int)($body['timerSeconds'] ?? 30)),
                trim((string)($body['explanation'] ?? '')),
                $now,
                $now,
            ]);
            $pdo->prepare('UPDATE soal_sets SET updated_at = ? WHERE id = ?')->execute([$now, $setId]);
            $q = $pdo->prepare('SELECT * FROM soal_questions WHERE id = ? LIMIT 1');
            $q->execute([$qId]);
            http_response_code(201);
            echo json_encode(['question' => mapQuestionRow($q->fetch())], JSON_UNESCAPED_UNICODE);
            break;
        }

        case 'update_question': {
            $qId = trim((string)($body['id'] ?? ''));
            $q = $pdo->prepare('SELECT * FROM soal_questions WHERE id = ? LIMIT 1');
            $q->execute([$qId]);
            $row = $q->fetch();
            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Soal tidak ditemukan.']);
                break;
            }
            $existing = mapQuestionRow($row);
            $pdo->prepare(
                'UPDATE soal_questions SET question_text = ?, question_image = ?, options_json = ?, correct_answer = ?, timer_seconds = ?, explanation = ?, is_active = ?, updated_at = ? WHERE id = ?'
            )->execute([
                array_key_exists('questionText', $body) ? trim((string)$body['questionText']) : $existing['questionText'],
                array_key_exists('questionImage', $body) ? trim((string)$body['questionImage']) : ($existing['questionImage'] ?? ''),
                json_encode(array_key_exists('options', $body) ? normalizeOptions($body['options']) : $existing['options'], JSON_UNESCAPED_UNICODE),
                array_key_exists('correctAnswer', $body) ? max(0, min(3, (int)$body['correctAnswer'])) : $existing['correctAnswer'],
                array_key_exists('timerSeconds', $body) ? max(0, (int)$body['timerSeconds']) : $existing['timerSeconds'],
                array_key_exists('explanation', $body) ? trim((string)$body['explanation']) : ($existing['explanation'] ?? ''),
                array_key_exists('isActive', $body) ? ($body['isActive'] ? 1 : 0) : ($existing['isActive'] ? 1 : 0),
                $now,
                $qId,
            ]);
            $pdo->prepare('UPDATE soal_sets SET updated_at = ? WHERE id = ?')->execute([$now, $existing['setId']]);
            $q->execute([$qId]);
            echo json_encode(['question' => mapQuestionRow($q->fetch())], JSON_UNESCAPED_UNICODE);
            break;
        }

        case 'delete_question': {
            $qId = trim((string)($body['id'] ?? ''));
            $pdo->prepare('DELETE FROM soal_questions WHERE id = ?')->execute([$qId]);
            echo json_encode(['ok' => true]);
            break;
        }

        case 'get_config': {
            $key = trim((string)($body['key'] ?? ''));
            $allowedKeys = ['admin_passcode_hash', 'auth_signing_secret'];
            if (!in_array($key, $allowedKeys, true)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kunci konfigurasi tidak valid.']);
                break;
            }
            $stmt = $pdo->prepare('SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1');
            $stmt->execute([$key]);
            $row = $stmt->fetch();
            echo json_encode(['value' => $row ? (string)$row['config_value'] : '']);
            break;
        }

        case 'set_config': {
            $key = trim((string)($body['key'] ?? ''));
            $val = (string)($body['value'] ?? '');
            $allowedKeys = ['admin_passcode_hash', 'auth_signing_secret'];
            if (!in_array($key, $allowedKeys, true) || $val === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Kunci atau nilai konfigurasi tidak valid.']);
                break;
            }
            if (!empty($body['ignoreIfExists'])) {
                $pdo->prepare('INSERT IGNORE INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?)')
                    ->execute([$key, $val, $now]);
                $stmt = $pdo->prepare('SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1');
                $stmt->execute([$key]);
                $row = $stmt->fetch();
                echo json_encode(['value' => $row ? (string)$row['config_value'] : $val]);
            } else {
                $pdo->prepare(
                    'INSERT INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_at = VALUES(updated_at)'
                )->execute([$key, $val, $now]);
                echo json_encode(['value' => $val]);
            }
            break;
        }

        default: {
            http_response_code(404);
            echo json_encode(['error' => 'Action tidak dikenal.']);
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan saat memproses database soal: ' . $e->getMessage()]);
}
