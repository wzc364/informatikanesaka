import crypto from 'crypto';
import mysql from 'mysql2/promise';

let cachedSigningSecret = '';
const FALLBACK_MEMORY_SECRET = crypto.randomBytes(32).toString('hex');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

let pool = null;
let poolKey = '';
let schemaInitialized = false;
let schemaPromise = null;
let memoryClaimedPasscodeHash = '';

const DEFAULT_POLA_BILANGAN_SET = {
  id: 'pola-bilangan-20-soal',
  title: 'Ujian Pola Bilangan Aritmetika & Geometri',
  description:
    '20 soal pilihan ganda tentang barisan dan deret aritmetika serta geometri. Skor 5 poin per soal, waktu pengerjaan 40 menit.',
  kelas: 'Semua Kelas',
  isActive: true,
  isFullScreen: true,
  isScoreVisible: true,
  timerMode: 'per_judul',
  titleTimerSeconds: 2400,
  defaultQuestionTimerSeconds: 120,
  shuffleQuestions: false,
  passingScore: 75,
};

const DEFAULT_POLA_BILANGAN_QUESTIONS = [
  {
    id: 'pb-q1',
    questionText: 'Suku ke-n dari barisan aritmetika 3, 7, 11, 15, ... adalah...',
    options: [{ text: '4n - 1' }, { text: '4n + 1' }, { text: '3n + 4' }, { text: '4n + 3' }],
    correctAnswer: 0,
    explanation: 'Suku pertama a = 3, beda b = 4. Un = a + (n-1)b = 3 + 4n - 4 = 4n - 1.',
    points: 5,
    timerSeconds: 120,
    order: 0,
  },
  {
    id: 'pb-q2',
    questionText: 'Diketahui barisan aritmetika 5, 8, 11, 14, ... Suku ke-10 dari barisan tersebut adalah...',
    options: [{ text: '29' }, { text: '32' }, { text: '35' }, { text: '38' }],
    correctAnswer: 1,
    explanation: 'a = 5, b = 3. U10 = a + 9b = 5 + 9(3) = 5 + 27 = 32.',
    points: 5,
    timerSeconds: 120,
    order: 1,
  },
  {
    id: 'pb-q3',
    questionText: 'Rumus suku ke-n untuk barisan geometri 2, 6, 18, 54, ... adalah...',
    options: [{ text: '2 × 3ⁿ' }, { text: '3 × 2ⁿ⁻¹' }, { text: '2 × 3ⁿ⁻¹' }, { text: '6ⁿ⁻¹' }],
    correctAnswer: 2,
    explanation: 'Suku pertama a = 2, rasio r = 3. Un = a × rⁿ⁻¹ = 2 × 3ⁿ⁻¹.',
    points: 5,
    timerSeconds: 120,
    order: 2,
  },
  {
    id: 'pb-q4',
    questionText: 'Suku ke-6 dari barisan geometri 1, 2, 4, 8, ... adalah...',
    options: [{ text: '16' }, { text: '32' }, { text: '64' }, { text: '128' }],
    correctAnswer: 1,
    explanation: 'a = 1, r = 2. U6 = a × r⁵ = 1 × 2⁵ = 32.',
    points: 5,
    timerSeconds: 120,
    order: 3,
  },
  {
    id: 'pb-q5',
    questionText: 'Diketahui deret aritmetika 2 + 5 + 8 + 11 + ... Jumlah 10 suku pertama adalah...',
    options: [{ text: '145' }, { text: '150' }, { text: '155' }, { text: '160' }],
    correctAnswer: 2,
    explanation: 'a = 2, b = 3, n = 10. Sn = n/2 (2a + (n-1)b) = 10/2 (4 + 9(3)) = 5 (31) = 155.',
    points: 5,
    timerSeconds: 120,
    order: 4,
  },
  {
    id: 'pb-q6',
    questionText: 'Suatu barisan aritmetika memiliki suku ke-4 = 14 dan suku ke-9 = 29. Suku ke-15 adalah...',
    options: [{ text: '41' }, { text: '44' }, { text: '47' }, { text: '50' }],
    correctAnswer: 2,
    explanation: 'U9 - U4 = 5b => 29 - 14 = 15 => b = 3. U4 = a + 3b = 14 => a = 5. U15 = 5 + 14(3) = 47.',
    points: 5,
    timerSeconds: 120,
    order: 5,
  },
  {
    id: 'pb-q7',
    questionText: 'Rasio dari barisan geometri 64, 32, 16, 8, ... adalah...',
    options: [{ text: '2' }, { text: '1/2' }, { text: '-2' }, { text: '1/4' }],
    correctAnswer: 1,
    explanation: 'Rasio r = U2 / U1 = 32 / 64 = 1/2.',
    points: 5,
    timerSeconds: 120,
    order: 6,
  },
  {
    id: 'pb-q8',
    questionText: 'Tiga suku berikutnya dari barisan bilangan 1, 3, 6, 10, 15, ... adalah...',
    options: [{ text: '18, 22, 27' }, { text: '21, 28, 36' }, { text: '20, 26, 33' }, { text: '21, 27, 34' }],
    correctAnswer: 1,
    explanation: 'Ini barisan bilangan segitiga (+2, +3, +4, +5, +6, +7, +8). Suku berikutnya: 15+6=21, 21+7=28, 28+8=36.',
    points: 5,
    timerSeconds: 120,
    order: 7,
  },
  {
    id: 'pb-q9',
    questionText: 'Suku ke-8 dari barisan geometri 3, 6, 12, 24, ... adalah...',
    options: [{ text: '192' }, { text: '384' }, { text: '768' }, { text: '1536' }],
    correctAnswer: 1,
    explanation: 'a = 3, r = 2. U8 = 3 × 2⁷ = 3 × 128 = 384.',
    points: 5,
    timerSeconds: 120,
    order: 8,
  },
  {
    id: 'pb-q10',
    questionText: 'Jika suku pertama barisan aritmetika adalah 7 dan bedanya 4, maka suku ke-20 adalah...',
    options: [{ text: '79' }, { text: '83' }, { text: '87' }, { text: '91' }],
    correctAnswer: 1,
    explanation: 'a = 7, b = 4. U20 = 7 + 19(4) = 7 + 76 = 83.',
    points: 5,
    timerSeconds: 120,
    order: 9,
  },
  {
    id: 'pb-q11',
    questionText: 'Amuba membelah diri menjadi 2 setiap 20 menit. Jika mula-mula ada 5 amuba, banyak amuba setelah 2 jam adalah...',
    options: [{ text: '160' }, { text: '320' }, { text: '640' }, { text: '1280' }],
    correctAnswer: 1,
    explanation: '2 jam = 120 menit. Banyak pembelahan = 120 / 20 = 6 kali. U7 = 5 × 2⁶ = 5 × 64 = 320.',
    points: 5,
    timerSeconds: 120,
    order: 10,
  },
  {
    id: 'pb-q12',
    questionText: 'Diketahui barisan bilangan kuadrat 1, 4, 9, 16, 25, ... Suku ke-13 barisan tersebut adalah...',
    options: [{ text: '144' }, { text: '169' }, { text: '196' }, { text: '225' }],
    correctAnswer: 1,
    explanation: 'Rumus suku ke-n adalah Un = n². U13 = 13² = 169.',
    points: 5,
    timerSeconds: 120,
    order: 11,
  },
  {
    id: 'pb-q13',
    questionText: 'Jumlah 6 suku pertama dari barisan geometri 3, 6, 12, 24, ... adalah...',
    options: [{ text: '93' }, { text: '189' }, { text: '378' }, { text: '765' }],
    correctAnswer: 1,
    explanation: 'a = 3, r = 2. S6 = a(r⁶ - 1)/(r - 1) = 3(64 - 1)/(2 - 1) = 3(63) = 189.',
    points: 5,
    timerSeconds: 120,
    order: 12,
  },
  {
    id: 'pb-q14',
    questionText: 'Suku kelima barisan aritmetika adalah 21 dan suku kesepuluh adalah 41. Beda barisan tersebut adalah...',
    options: [{ text: '3' }, { text: '4' }, { text: '5' }, { text: '6' }],
    correctAnswer: 1,
    explanation: 'U10 - U5 = 5b => 41 - 21 = 20 => b = 4.',
    points: 5,
    timerSeconds: 120,
    order: 13,
  },
  {
    id: 'pb-q15',
    questionText: 'Seutas tali dipotong menjadi 5 bagian membentuk barisan geometri. Jika potongan terpendek 3 cm dan terpanjang 768 cm, panjang tali semula adalah...',
    options: [{ text: '771 cm' }, { text: '1023 cm' }, { text: '1536 cm' }, { text: '3069 cm' }],
    correctAnswer: 1,
    explanation: 'a = 3, U5 = 3r⁴ = 768 => r⁴ = 256 => r = 4. S5 = 3(1024 - 1)/3 = 1023 cm.',
    points: 5,
    timerSeconds: 120,
    order: 14,
  },
  {
    id: 'pb-q16',
    questionText: 'Suku ke-n suatu barisan ditentukan oleh Un = 3n² - 2. Suku ke-7 dari barisan tersebut adalah...',
    options: [{ text: '145' }, { text: '147' }, { text: '150' }, { text: '142' }],
    correctAnswer: 0,
    explanation: 'U7 = 3(7)² - 2 = 3(49) - 2 = 147 - 2 = 145.',
    points: 5,
    timerSeconds: 120,
    order: 15,
  },
  {
    id: 'pb-q17',
    questionText: 'Suku ke-15 dari barisan aritmetika 50, 45, 40, 35, ... adalah...',
    options: [{ text: '-15' }, { text: '-20' }, { text: '-25' }, { text: '20' }],
    correctAnswer: 1,
    explanation: 'a = 50, b = -5. U15 = 50 + 14(-5) = 50 - 70 = -20.',
    points: 5,
    timerSeconds: 120,
    order: 16,
  },
  {
    id: 'pb-q18',
    questionText: 'Suatu gedung pertunjukan memiliki 15 baris kursi. Baris pertama berisi 20 kursi, baris kedua 24 kursi, baris ketiga 28 kursi, dan seterusnya. Jumlah seluruh kursi adalah...',
    options: [{ text: '680' }, { text: '700' }, { text: '720' }, { text: '750' }],
    correctAnswer: 2,
    explanation: 'a = 20, b = 4, n = 15. S15 = 15/2 (40 + 56) = 7.5 (96) = 720.',
    points: 5,
    timerSeconds: 120,
    order: 17,
  },
  {
    id: 'pb-q19',
    questionText: 'Suku tengah dari barisan aritmetika 3, 7, 11, ..., 99 adalah...',
    options: [{ text: '49' }, { text: '51' }, { text: '53' }, { text: '55' }],
    correctAnswer: 1,
    explanation: 'Ut = (a + Un) / 2 = (3 + 99) / 2 = 102 / 2 = 51.',
    points: 5,
    timerSeconds: 120,
    order: 18,
  },
  {
    id: 'pb-q20',
    questionText: 'Diketahui barisan geometri dengan U2 = 6 dan U5 = 162. Suku ke-4 dari barisan tersebut adalah...',
    options: [{ text: '18' }, { text: '36' }, { text: '54' }, { text: '108' }],
    correctAnswer: 2,
    explanation: 'U5 / U2 = r³ = 162 / 6 = 27 => r = 3. U2 = 2a = 6 => a = 2. U4 = 2 × 3³ = 54.',
    points: 5,
    timerSeconds: 120,
    order: 19,
  },
];

function getPhpBridgeConfig() {
  const url = String(process.env.PHP_SOAL_API_URL || '').trim();
  const apiKey = String(process.env.PHP_SOAL_API_KEY || '').trim();
  return { url, apiKey };
}

export function isPhpBridgeConfigured() {
  const cfg = getPhpBridgeConfig();
  return Boolean(cfg.url && cfg.apiKey);
}

function isPrivateOrLoopbackHost(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!h) return true;
  if (h === 'localhost' || h === '::1' || h.endsWith('.local') || h.endsWith('.internal')) {
    return true;
  }
  // IPv4 literal check
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

function validatePhpBridgeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Format PHP_SOAL_API_URL tidak valid. Gunakan URL lengkap seperti https://domainanda.com/api-soal/soal_api.php');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('PHP_SOAL_API_URL harus menggunakan protokol https:// atau http://');
  }
  if (isPrivateOrLoopbackHost(parsed.hostname)) {
    throw new Error('PHP_SOAL_API_URL tidak boleh mengarah ke alamat lokal/private.');
  }
  return parsed.toString();
}

async function callPhpBridge(action, payload = {}) {
  const { url, apiKey } = getPhpBridgeConfig();
  const safeUrl = validatePhpBridgeUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch(safeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; KelolaSoalBridge/1.0)',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ action, apiKey, ...payload }),
      signal: controller.signal,
    });
    const rawText = await resp.text();
    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = null;
    }

    if (data && typeof data === 'object') {
      return { status: resp.status, payload: data };
    }

    const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleHint = titleMatch ? titleMatch[1].trim() : '';
    const snippet = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
    let hint = `PHP Bridge merespons HTTP ${resp.status} (bukan JSON).`;
    if (resp.status === 404) {
      hint = `PHP Bridge HTTP 404 (File tidak ditemukan): pastikan PHP_SOAL_API_URL mengarah persis ke file soal_api.php di cPanel.`;
    } else if (resp.status === 403) {
      hint = `PHP Bridge HTTP 403 (Akses ditolak firewall/ModSecurity/Cloudflare hosting): ${titleHint || snippet || 'cek aturan keamanan cPanel.'}`;
    } else if (resp.status >= 500) {
      hint = `PHP Bridge HTTP ${resp.status} (Error PHP di cPanel): ${titleHint || snippet || 'cek versi PHP / isi soal_config.php.'}`;
    } else if (titleHint || snippet) {
      hint = `PHP Bridge HTTP ${resp.status}: ${titleHint || snippet}`;
    }
    return { status: resp.status >= 400 ? resp.status : 502, payload: { error: hint } };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Waktu koneksi ke PHP_SOAL_API_URL habis (timeout).');
    }
    const causeCode = err?.cause?.code || err?.code || '';
    const causeMsg = err?.cause?.message || '';
    if (
      causeCode === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
      causeCode === 'SELF_SIGNED_CERT_IN_CHAIN' ||
      causeCode === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
      causeCode === 'CERT_HAS_EXPIRED' ||
      causeCode === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
    ) {
      throw new Error(
        `Sertifikat SSL (https://) di PHP_SOAL_API_URL belum valid (${causeCode}). Gunakan http://db.smpn1kawali.sch.id/soal_api.php sementara lalu Redeploy, atau aktifkan SSL valid (AutoSSL/Cloudflare).`
      );
    }
    const detail = [causeCode, causeMsg].filter(Boolean).join(' - ');
    throw new Error(
      detail
        ? `Gagal menghubungi PHP_SOAL_API_URL (${detail}).`
        : err?.message || 'Gagal menghubungi PHP_SOAL_API_URL.'
    );
  } finally {
    clearTimeout(timer);
  }
}

function getMysqlConfig() {
  const host = String(process.env.MYSQL_HOST || '').trim();
  const port = Number(process.env.MYSQL_PORT || 3306) || 3306;
  const user = String(process.env.MYSQL_USER || '').trim();
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = String(process.env.MYSQL_DATABASE || '').trim();
  const useSsl = String(process.env.MYSQL_SSL || '').trim().toLowerCase() === 'true';
  return { host, port, user, password, database, useSsl };
}

export function isMysqlConfigured() {
  if (isPhpBridgeConfigured()) return true;
  const cfg = getMysqlConfig();
  return Boolean(cfg.host && cfg.user && cfg.database);
}

function getPool() {
  const cfg = getMysqlConfig();
  if (!cfg.host || !cfg.user || !cfg.database) {
    const err = new Error(
      'Koneksi MySQL (phpMyAdmin) belum dikonfigurasi. Isi MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, dan MYSQL_DATABASE di Secrets / Environment Variables.'
    );
    err.code = 'MYSQL_NOT_CONFIGURED';
    throw err;
  }

  const key = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.database}:${cfg.useSsl}`;
  if (!pool || poolKey !== key) {
    if (pool) {
      pool.end().catch(() => {});
    }
    poolKey = key;
    schemaInitialized = false;
    schemaPromise = null;
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 8000,
      charset: 'utf8mb4',
      ...(cfg.useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return pool;
}

async function ensureSchema() {
  const activePool = getPool();
  if (schemaInitialized) return activePool;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    await activePool.execute(`
      CREATE TABLE IF NOT EXISTS \`soal_sets\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`kelas\` VARCHAR(100) NOT NULL DEFAULT 'Semua Kelas',
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`is_full_screen\` TINYINT(1) NOT NULL DEFAULT 0,
        \`is_score_visible\` TINYINT(1) NOT NULL DEFAULT 1,
        \`timer_mode\` VARCHAR(32) NOT NULL DEFAULT 'per_judul',
        \`title_timer_seconds\` INT NOT NULL DEFAULT 900,
        \`default_question_timer_seconds\` INT NOT NULL DEFAULT 30,
        \`shuffle_questions\` TINYINT(1) NOT NULL DEFAULT 0,
        \`passing_score\` INT NULL,
        \`created_at\` VARCHAR(40) NOT NULL,
        \`updated_at\` VARCHAR(40) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_soal_sets_active\` (\`is_active\`),
        INDEX \`idx_soal_sets_updated\` (\`updated_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await activePool.execute(`
      CREATE TABLE IF NOT EXISTS \`soal_questions\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`set_id\` VARCHAR(100) NOT NULL,
        \`sort_order\` INT NOT NULL DEFAULT 0,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`question_text\` LONGTEXT NOT NULL,
        \`question_image\` LONGTEXT NULL,
        \`options_json\` LONGTEXT NOT NULL,
        \`correct_answer\` TINYINT NOT NULL DEFAULT 0,
        \`timer_seconds\` INT NOT NULL DEFAULT 30,
        \`explanation\` LONGTEXT NULL,
        \`points\` INT NULL,
        \`created_at\` VARCHAR(40) NOT NULL,
        \`updated_at\` VARCHAR(40) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_soal_questions_set_order\` (\`set_id\`, \`sort_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await activePool.execute(`
      CREATE TABLE IF NOT EXISTS \`soal_admin_config\` (
        \`config_key\` VARCHAR(100) NOT NULL,
        \`config_value\` TEXT NOT NULL,
        \`updated_at\` VARCHAR(40) NOT NULL,
        PRIMARY KEY (\`config_key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await seedDefaultSetOnce(activePool);
    schemaInitialized = true;
    return activePool;
  })().catch((err) => {
    schemaPromise = null;
    throw err;
  });

  return schemaPromise;
}

async function seedDefaultSetOnce(activePool) {
  const [seededRows] = await activePool.execute(
    'SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1',
    ['seeded_pola_bilangan']
  );
  if (Array.isArray(seededRows) && seededRows.length > 0) {
    return;
  }

  const [countRows] = await activePool.execute('SELECT COUNT(*) AS cnt FROM soal_sets');
  const existingCount = Number(countRows?.[0]?.cnt || 0);
  const now = new Date().toISOString();

  if (existingCount === 0) {
    const conn = await activePool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(
        `INSERT INTO soal_sets (
          id, title, description, kelas, is_active, is_full_screen, is_score_visible,
          timer_mode, title_timer_seconds, default_question_timer_seconds, shuffle_questions,
          passing_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DEFAULT_POLA_BILANGAN_SET.id,
          DEFAULT_POLA_BILANGAN_SET.title,
          DEFAULT_POLA_BILANGAN_SET.description,
          DEFAULT_POLA_BILANGAN_SET.kelas,
          1,
          1,
          1,
          DEFAULT_POLA_BILANGAN_SET.timerMode,
          DEFAULT_POLA_BILANGAN_SET.titleTimerSeconds,
          DEFAULT_POLA_BILANGAN_SET.defaultQuestionTimerSeconds,
          0,
          DEFAULT_POLA_BILANGAN_SET.passingScore,
          now,
          now,
        ]
      );

      for (const q of DEFAULT_POLA_BILANGAN_QUESTIONS) {
        await conn.execute(
          `INSERT INTO soal_questions (
            id, set_id, sort_order, is_active, question_text, question_image,
            options_json, correct_answer, timer_seconds, explanation, points, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            q.id,
            DEFAULT_POLA_BILANGAN_SET.id,
            q.order,
            1,
            q.questionText,
            '',
            JSON.stringify(q.options),
            q.correctAnswer,
            q.timerSeconds,
            q.explanation,
            q.points,
            now,
            now,
          ]
        );
      }

      await conn.execute(
        'INSERT IGNORE INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?)',
        ['seeded_pola_bilangan', '1', now]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback().catch(() => {});
      throw err;
    } finally {
      conn.release();
    }
  } else {
    await activePool.execute(
      'INSERT IGNORE INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?)',
      ['seeded_pola_bilangan', '1', now]
    );
  }
}

function mapSetRow(row) {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    description: String(row.description || ''),
    kelas: String(row.kelas || 'Semua Kelas'),
    isActive: Boolean(Number(row.is_active)),
    isFullScreen: Boolean(Number(row.is_full_screen)),
    isScoreVisible: Boolean(Number(row.is_score_visible)),
    timerMode: row.timer_mode === 'per_soal' ? 'per_soal' : 'per_judul',
    titleTimerSeconds: Number(row.title_timer_seconds ?? 900),
    defaultQuestionTimerSeconds: Number(row.default_question_timer_seconds ?? 30),
    shuffleQuestions: Boolean(Number(row.shuffle_questions)),
    ...(row.passing_score !== null && row.passing_score !== undefined
      ? { passingScore: Number(row.passing_score) }
      : {}),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

function normalizeOptions(raw) {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = [];
    }
  }
  const arr = Array.isArray(parsed) ? parsed : [];
  const padded = [0, 1, 2, 3].map((idx) => {
    const item = arr[idx] && typeof arr[idx] === 'object' ? arr[idx] : {};
    const text = String(item.text || '').trim();
    const image = String(item.image || '').trim();
    return image ? { text, image } : { text };
  });
  return padded;
}

function mapQuestionRow(row) {
  return {
    id: String(row.id),
    setId: String(row.set_id),
    order: Number(row.sort_order ?? 0),
    isActive: Boolean(Number(row.is_active)),
    questionText: String(row.question_text || ''),
    ...(row.question_image ? { questionImage: String(row.question_image) } : {}),
    options: normalizeOptions(row.options_json),
    correctAnswer: Math.min(3, Math.max(0, Number(row.correct_answer || 0))),
    timerSeconds: Number(row.timer_seconds ?? 30),
    ...(row.explanation ? { explanation: String(row.explanation) } : {}),
    ...(row.points !== null && row.points !== undefined ? { points: Number(row.points) } : {}),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

function generateId(prefix = 'soal') {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

// ========== AUTH HELPERS ==========
function getEnvPasscode() {
  return String(process.env.ADMIN_PASSCODE || '').trim();
}

function hashPasscode(passcode) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPasscodeHash(passcode, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hexDigest] = parts;
  const derived = crypto.scryptSync(passcode, salt, 64);
  const target = Buffer.from(hexDigest, 'hex');
  if (derived.length !== target.length) return false;
  return crypto.timingSafeEqual(derived, target);
}

function safeEqualStrings(a, b) {
  const da = crypto.createHash('sha256').update(String(a || '')).digest();
  const db = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(da, db);
}

async function getClaimedPasscodeHash() {
  if (isPhpBridgeConfigured()) {
    try {
      const res = await callPhpBridge('get_config', { key: 'admin_passcode_hash' });
      if (res.status === 200 && res.payload?.value) {
        return String(res.payload.value);
      }
    } catch {
      // Fall back to in-memory hash if bridge unavailable
    }
    return memoryClaimedPasscodeHash;
  }
  if (isMysqlConfigured()) {
    try {
      const activePool = await ensureSchema();
      const [rows] = await activePool.execute(
        'SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1',
        ['admin_passcode_hash']
      );
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.config_value) {
        return String(rows[0].config_value);
      }
    } catch {
      // Fall back to in-memory hash if DB unavailable
    }
  }
  return memoryClaimedPasscodeHash;
}

async function saveClaimedPasscodeHash(hashValue) {
  memoryClaimedPasscodeHash = hashValue;
  if (isPhpBridgeConfigured()) {
    const res = await callPhpBridge('set_config', {
      key: 'admin_passcode_hash',
      value: hashValue,
      ignoreIfExists: false,
    });
    if (res.status >= 400) {
      throw new Error(res.payload?.error || 'Gagal menyimpan passcode admin via PHP Bridge.');
    }
    return;
  }
  if (isMysqlConfigured()) {
    const activePool = await ensureSchema();
    const now = new Date().toISOString();
    await activePool.execute(
      `INSERT INTO soal_admin_config (config_key, config_value, updated_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_at = VALUES(updated_at)`,
      ['admin_passcode_hash', hashValue, now]
    );
  }
}

async function getSigningSecret() {
  const envSecret = String(
    process.env.SOAL_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || ''
  ).trim();
  if (envSecret) return envSecret;
  if (cachedSigningSecret) return cachedSigningSecret;

  if (isPhpBridgeConfigured()) {
    try {
      const existing = await callPhpBridge('get_config', { key: 'auth_signing_secret' });
      if (existing.status === 200 && existing.payload?.value) {
        cachedSigningSecret = String(existing.payload.value);
        return cachedSigningSecret;
      }
      const generated = crypto.randomBytes(32).toString('hex');
      const saved = await callPhpBridge('set_config', {
        key: 'auth_signing_secret',
        value: generated,
        ignoreIfExists: true,
      });
      cachedSigningSecret = String(saved.payload?.value || generated);
      return cachedSigningSecret;
    } catch {
      return FALLBACK_MEMORY_SECRET;
    }
  }

  if (isMysqlConfigured()) {
    try {
      const activePool = await ensureSchema();
      const [rows] = await activePool.execute(
        'SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1',
        ['auth_signing_secret']
      );
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.config_value) {
        cachedSigningSecret = String(rows[0].config_value);
        return cachedSigningSecret;
      }
      const generated = crypto.randomBytes(32).toString('hex');
      const now = new Date().toISOString();
      await activePool.execute(
        'INSERT IGNORE INTO soal_admin_config (config_key, config_value, updated_at) VALUES (?, ?, ?)',
        ['auth_signing_secret', generated, now]
      );
      const [reRead] = await activePool.execute(
        'SELECT config_value FROM soal_admin_config WHERE config_key = ? LIMIT 1',
        ['auth_signing_secret']
      );
      cachedSigningSecret = String(reRead?.[0]?.config_value || generated);
      return cachedSigningSecret;
    } catch {
      // Fall back to in-memory secret if DB unavailable
    }
  }
  return FALLBACK_MEMORY_SECRET;
}

async function issueAdminToken() {
  const secret = await getSigningSecret();
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_TTL_MS })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export async function verifyAdminToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1].trim();
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  const secret = await getSigningSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(sigB64);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (parsed?.role !== 'admin' || typeof parsed?.exp !== 'number') return false;
    return parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function formatDbError(err) {
  if (err?.code === 'MYSQL_NOT_CONFIGURED') {
    return {
      status: 503,
      message: err.message,
      code: 'MYSQL_NOT_CONFIGURED',
    };
  }
  const code = err?.code || '';
  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
    return {
      status: 502,
      message:
        'Tidak dapat terhubung ke server MySQL (port 3306 diblokir firewall hosting atau host/port salah). Pastikan MYSQL_HOST memakai IP server cPanel (Shared IP Address), atau unggah jembatan API PHP (database/soal_api.php) ke cPanel dan isi PHP_SOAL_API_URL + PHP_SOAL_API_KEY di Vercel.',
      code,
    };
  }
  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return {
      status: 502,
      message:
        'Akses ke MySQL ditolak. Periksa MYSQL_USER, MYSQL_PASSWORD, dan izin host (%) pada Remote MySQL.',
      code,
    };
  }
  if (code === 'ER_BAD_DB_ERROR') {
    return {
      status: 502,
      message: 'Nama database (MYSQL_DATABASE) tidak ditemukan di server MySQL.',
      code,
    };
  }
  return {
    status: 500,
    message: err?.message || 'Terjadi kesalahan saat mengakses database MySQL.',
    code: code || 'MYSQL_ERROR',
  };
}

// ========== ROUTE DISPATCHER ==========
export async function handleSoalApiRequest({ method, subPath, body, authHeader }) {
  const cleanMethod = String(method || 'GET').toUpperCase();
  const cleanPath = String(subPath || '').replace(/^\/+|\/+$/g, '');

  // Auth status
  if (cleanMethod === 'GET' && cleanPath === 'auth/status') {
    const envPasscode = getEnvPasscode();
    const claimedHash = envPasscode ? '' : await getClaimedPasscodeHash();
    const autoToken = envPasscode ? await issueAdminToken() : '';
    return {
      status: 200,
      payload: {
        configured: isMysqlConfigured(),
        hasEnvPasscode: Boolean(envPasscode),
        hasClaimedPasscode: Boolean(claimedHash),
        authenticated: Boolean(envPasscode) || (await verifyAdminToken(authHeader)),
        ...(autoToken ? { token: autoToken } : {}),
      },
    };
  }

  // Auth login
  if (cleanMethod === 'POST' && cleanPath === 'auth/login') {
    const passcode = String(body?.passcode || '').trim();
    if (!passcode) {
      return { status: 400, payload: { error: 'Masukkan passcode admin.' } };
    }
    const envPasscode = getEnvPasscode();
    if (envPasscode) {
      if (passcode && !safeEqualStrings(passcode, envPasscode)) {
        return { status: 401, payload: { error: 'Passcode admin tidak sesuai.' } };
      }
      return { status: 200, payload: { token: await issueAdminToken() } };
    }

    const claimedHash = await getClaimedPasscodeHash();
    if (!claimedHash) {
      return {
        status: 409,
        payload: {
          error: 'Passcode admin belum dibuat. Silakan buat passcode admin pertama kali.',
          needsSetup: true,
        },
      };
    }

    if (!verifyPasscodeHash(passcode, claimedHash)) {
      return { status: 401, payload: { error: 'Passcode admin tidak sesuai.' } };
    }
    return { status: 200, payload: { token: await issueAdminToken() } };
  }

  // First-run passcode claim (disabled automatically once ADMIN_PASSCODE env is set or hash claimed)
  if (cleanMethod === 'POST' && cleanPath === 'auth/claim') {
    const envPasscode = getEnvPasscode();
    if (envPasscode) {
      return {
        status: 403,
        payload: { error: 'Passcode admin sudah dikunci melalui environment variable ADMIN_PASSCODE.' },
      };
    }
    const existingClaim = await getClaimedPasscodeHash();
    if (existingClaim) {
      return {
        status: 409,
        payload: { error: 'Passcode admin sudah pernah dibuat sebelumnya. Silakan login.' },
      };
    }
    const passcode = String(body?.passcode || '').trim();
    if (passcode.length < 4) {
      return { status: 400, payload: { error: 'Passcode admin minimal 4 karakter.' } };
    }
    try {
      const hashed = hashPasscode(passcode);
      await saveClaimedPasscodeHash(hashed);
      return { status: 201, payload: { token: await issueAdminToken() } };
    } catch (err) {
      const mapped = formatDbError(err);
      return { status: mapped.status, payload: { error: mapped.message, code: mapped.code } };
    }
  }

  // Health check
  if (cleanMethod === 'GET' && cleanPath === 'health') {
    if (!isMysqlConfigured()) {
      return {
        status: 200,
        payload: {
          configured: false,
          connected: false,
          message:
            'Koneksi MySQL (phpMyAdmin) belum dikonfigurasi pada Environment Variables (Vercel) / Secrets.',
        },
      };
    }
    if (isPhpBridgeConfigured()) {
      try {
        const res = await callPhpBridge('health');
        return {
          status: 200,
          payload: res.status === 200 ? res.payload : { configured: true, connected: false, error: res.payload?.error },
        };
      } catch (err) {
        return {
          status: 200,
          payload: { configured: true, connected: false, error: err?.message || 'Gagal menghubungi PHP Bridge.' },
        };
      }
    }
    try {
      const activePool = await ensureSchema();
      await activePool.execute('SELECT 1 AS ok');
      return { status: 200, payload: { configured: true, connected: true } };
    } catch (err) {
      const mapped = formatDbError(err);
      return {
        status: 200,
        payload: { configured: true, connected: false, error: mapped.message, code: mapped.code },
      };
    }
  }

  // GET /api/soal -> load all sets and questions
  if (cleanMethod === 'GET' && cleanPath === '') {
    if (!isMysqlConfigured()) {
      return {
        status: 200,
        payload: {
          configured: false,
          sets: [],
          questions: [],
          error:
            'Penyimpanan Kelola Soal menggunakan MySQL (phpMyAdmin), namun Environment Variables MYSQL_HOST, MYSQL_USER, dan MYSQL_DATABASE belum terbaca di server.',
        },
      };
    }
    if (isPhpBridgeConfigured()) {
      try {
        const res = await callPhpBridge('list');
        if (res.status >= 400) {
          return {
            status: res.status,
            payload: { configured: true, sets: [], questions: [], error: res.payload?.error || 'Gagal memuat data dari PHP Bridge.' },
          };
        }
        return {
          status: 200,
          payload: {
            configured: true,
            sets: Array.isArray(res.payload?.sets) ? res.payload.sets : [],
            questions: Array.isArray(res.payload?.questions) ? res.payload.questions : [],
          },
        };
      } catch (err) {
        return {
          status: 502,
          payload: { configured: true, sets: [], questions: [], error: err?.message || 'Gagal menghubungi PHP Bridge.' },
        };
      }
    }
    try {
      const activePool = await ensureSchema();
      const [setRows] = await activePool.execute(
        'SELECT * FROM soal_sets ORDER BY updated_at DESC, created_at DESC'
      );
      const [qRows] = await activePool.execute(
        'SELECT * FROM soal_questions ORDER BY sort_order ASC, created_at ASC'
      );
      return {
        status: 200,
        payload: {
          configured: true,
          sets: Array.isArray(setRows) ? setRows.map(mapSetRow) : [],
          questions: Array.isArray(qRows) ? qRows.map(mapQuestionRow) : [],
        },
      };
    } catch (err) {
      const mapped = formatDbError(err);
      return {
        status: mapped.status,
        payload: {
          configured: true,
          sets: [],
          questions: [],
          error: mapped.message,
          code: mapped.code,
        },
      };
    }
  }

  // All write operations require valid admin Bearer token
  if (!(await verifyAdminToken(authHeader))) {
    return {
      status: 401,
      payload: {
        error: 'Sesi admin belum terverifikasi. Masukkan passcode admin untuk mengubah data Kelola Soal.',
        code: 'ADMIN_UNAUTHORIZED',
      },
    };
  }

  if (!isMysqlConfigured()) {
    return {
      status: 503,
      payload: {
        error:
          'Database MySQL (phpMyAdmin) belum dikonfigurasi. Tambahkan MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, dan MYSQL_DATABASE (atau PHP_SOAL_API_URL & PHP_SOAL_API_KEY) di Environment Variables.',
        code: 'MYSQL_NOT_CONFIGURED',
      },
    };
  }

  // Delegate write operations to cPanel PHP HTTPS Bridge when configured
  if (isPhpBridgeConfigured()) {
    try {
      const setMatchBridge = cleanPath.match(/^sets\/([^/]+)$/);
      const qMatchBridge = cleanPath.match(/^questions\/([^/]+)$/);

      if (cleanMethod === 'POST' && cleanPath === 'sets') {
        return await callPhpBridge('create_set', body || {});
      }
      if (cleanMethod === 'PUT' && setMatchBridge) {
        return await callPhpBridge('update_set', { ...(body || {}), id: decodeURIComponent(setMatchBridge[1]) });
      }
      if (cleanMethod === 'DELETE' && setMatchBridge) {
        return await callPhpBridge('delete_set', { id: decodeURIComponent(setMatchBridge[1]) });
      }
      if (cleanMethod === 'POST' && cleanPath === 'questions/toggle-all') {
        return await callPhpBridge('toggle_all_questions', body || {});
      }
      if (cleanMethod === 'POST' && cleanPath === 'questions/bulk') {
        return await callPhpBridge('bulk_questions', body || {});
      }
      if (cleanMethod === 'POST' && cleanPath === 'questions') {
        return await callPhpBridge('create_question', body || {});
      }
      if (cleanMethod === 'PUT' && qMatchBridge) {
        return await callPhpBridge('update_question', { ...(body || {}), id: decodeURIComponent(qMatchBridge[1]) });
      }
      if (cleanMethod === 'DELETE' && qMatchBridge) {
        return await callPhpBridge('delete_question', { id: decodeURIComponent(qMatchBridge[1]) });
      }
      return { status: 404, payload: { error: 'Endpoint Kelola Soal tidak ditemukan.' } };
    } catch (err) {
      return {
        status: 502,
        payload: { error: err?.message || 'Gagal menghubungi PHP Bridge.' },
      };
    }
  }

  try {
    const activePool = await ensureSchema();
    const now = new Date().toISOString();

    // POST /api/soal/sets -> create set
    if (cleanMethod === 'POST' && cleanPath === 'sets') {
      const title = String(body?.title || '').trim();
      if (!title) {
        return { status: 400, payload: { error: 'Judul kartu soal wajib diisi.' } };
      }
      const id = String(body?.id || '').trim() || generateId('set');
      const description = String(body?.description || '').trim();
      const kelas = String(body?.kelas || '').trim() || 'Semua Kelas';
      const isActive = body?.isActive === undefined ? 1 : body.isActive ? 1 : 0;
      const isFullScreen = body?.isFullScreen ? 1 : 0;
      const isScoreVisible = body?.isScoreVisible === undefined ? 1 : body.isScoreVisible ? 1 : 0;
      const timerMode = body?.timerMode === 'per_soal' ? 'per_soal' : 'per_judul';
      const titleTimerSeconds = Math.max(0, Number(body?.titleTimerSeconds ?? 900) || 0);
      const defaultQuestionTimerSeconds = Math.max(
        5,
        Number(body?.defaultQuestionTimerSeconds ?? 30) || 30
      );
      const shuffleQuestions = body?.shuffleQuestions ? 1 : 0;

      await activePool.execute(
        `INSERT INTO soal_sets (
          id, title, description, kelas, is_active, is_full_screen, is_score_visible,
          timer_mode, title_timer_seconds, default_question_timer_seconds, shuffle_questions,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          description,
          kelas,
          isActive,
          isFullScreen,
          isScoreVisible,
          timerMode,
          titleTimerSeconds,
          defaultQuestionTimerSeconds,
          shuffleQuestions,
          now,
          now,
        ]
      );

      const [rows] = await activePool.execute('SELECT * FROM soal_sets WHERE id = ? LIMIT 1', [id]);
      return { status: 201, payload: { set: mapSetRow(rows[0]) } };
    }

    // PUT /api/soal/sets/:id -> update set
    const setMatch = cleanPath.match(/^sets\/([^/]+)$/);
    if (cleanMethod === 'PUT' && setMatch) {
      const setId = decodeURIComponent(setMatch[1]);
      const [existingRows] = await activePool.execute(
        'SELECT * FROM soal_sets WHERE id = ? LIMIT 1',
        [setId]
      );
      if (!Array.isArray(existingRows) || existingRows.length === 0) {
        return { status: 404, payload: { error: 'Kartu soal tidak ditemukan.' } };
      }
      const existing = mapSetRow(existingRows[0]);
      const title =
        body?.title !== undefined ? String(body.title).trim() : existing.title;
      if (!title) {
        return { status: 400, payload: { error: 'Judul kartu soal tidak boleh kosong.' } };
      }
      const description =
        body?.description !== undefined ? String(body.description).trim() : existing.description;
      const kelas =
        body?.kelas !== undefined ? String(body.kelas).trim() || 'Semua Kelas' : existing.kelas;
      const isActive =
        body?.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive ? 1 : 0;
      const isFullScreen =
        body?.isFullScreen !== undefined
          ? body.isFullScreen
            ? 1
            : 0
          : existing.isFullScreen
          ? 1
          : 0;
      const isScoreVisible =
        body?.isScoreVisible !== undefined
          ? body.isScoreVisible
            ? 1
            : 0
          : existing.isScoreVisible
          ? 1
          : 0;
      const timerMode =
        body?.timerMode !== undefined
          ? body.timerMode === 'per_soal'
            ? 'per_soal'
            : 'per_judul'
          : existing.timerMode;
      const titleTimerSeconds =
        body?.titleTimerSeconds !== undefined
          ? Math.max(0, Number(body.titleTimerSeconds) || 0)
          : existing.titleTimerSeconds;
      const defaultQuestionTimerSeconds =
        body?.defaultQuestionTimerSeconds !== undefined
          ? Math.max(5, Number(body.defaultQuestionTimerSeconds) || 30)
          : existing.defaultQuestionTimerSeconds;
      const shuffleQuestions =
        body?.shuffleQuestions !== undefined
          ? body.shuffleQuestions
            ? 1
            : 0
          : existing.shuffleQuestions
          ? 1
          : 0;

      await activePool.execute(
        `UPDATE soal_sets
         SET title = ?, description = ?, kelas = ?, is_active = ?, is_full_screen = ?,
             is_score_visible = ?, timer_mode = ?, title_timer_seconds = ?,
             default_question_timer_seconds = ?, shuffle_questions = ?, updated_at = ?
         WHERE id = ?`,
        [
          title,
          description,
          kelas,
          isActive,
          isFullScreen,
          isScoreVisible,
          timerMode,
          titleTimerSeconds,
          defaultQuestionTimerSeconds,
          shuffleQuestions,
          now,
          setId,
        ]
      );

      const [updatedRows] = await activePool.execute(
        'SELECT * FROM soal_sets WHERE id = ? LIMIT 1',
        [setId]
      );
      return { status: 200, payload: { set: mapSetRow(updatedRows[0]) } };
    }

    // DELETE /api/soal/sets/:id -> delete set & child questions
    if (cleanMethod === 'DELETE' && setMatch) {
      const setId = decodeURIComponent(setMatch[1]);
      const conn = await activePool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute('DELETE FROM soal_questions WHERE set_id = ?', [setId]);
        await conn.execute('DELETE FROM soal_sets WHERE id = ?', [setId]);
        await conn.commit();
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }
      return { status: 200, payload: { ok: true } };
    }

    // POST /api/soal/questions/toggle-all
    if (cleanMethod === 'POST' && cleanPath === 'questions/toggle-all') {
      const setId = String(body?.setId || '').trim();
      const activate = Boolean(body?.activate);
      if (!setId) {
        return { status: 400, payload: { error: 'setId wajib diisi.' } };
      }
      await activePool.execute(
        'UPDATE soal_questions SET is_active = ?, updated_at = ? WHERE set_id = ?',
        [activate ? 1 : 0, now, setId]
      );
      await activePool.execute('UPDATE soal_sets SET updated_at = ? WHERE id = ?', [now, setId]);
      return { status: 200, payload: { ok: true } };
    }

    // POST /api/soal/questions/bulk (supports optional newSet creation + bulk questions)
    if (cleanMethod === 'POST' && cleanPath === 'questions/bulk') {
      const rawQuestions = Array.isArray(body?.questions) ? body.questions : [];
      if (rawQuestions.length === 0) {
        return { status: 400, payload: { error: 'Daftar soal tidak boleh kosong.' } };
      }

      const conn = await activePool.getConnection();
      try {
        await conn.beginTransaction();
        let targetSetId = String(body?.setId || '').trim();

        if (body?.newSet && typeof body.newSet === 'object') {
          const ns = body.newSet;
          const title = String(ns.title || '').trim();
          if (!title) {
            await conn.rollback();
            return { status: 400, payload: { error: 'Judul kartu soal baru wajib diisi.' } };
          }
          targetSetId = String(ns.id || '').trim() || generateId('set');
          await conn.execute(
            `INSERT INTO soal_sets (
              id, title, description, kelas, is_active, is_full_screen, is_score_visible,
              timer_mode, title_timer_seconds, default_question_timer_seconds, shuffle_questions,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              targetSetId,
              title,
              String(ns.description || '').trim(),
              String(ns.kelas || '').trim() || 'Semua Kelas',
              ns.isActive === undefined ? 1 : ns.isActive ? 1 : 0,
              ns.isFullScreen ? 1 : 0,
              ns.isScoreVisible === undefined ? 1 : ns.isScoreVisible ? 1 : 0,
              ns.timerMode === 'per_soal' ? 'per_soal' : 'per_judul',
              Math.max(0, Number(ns.titleTimerSeconds ?? 900) || 0),
              Math.max(5, Number(ns.defaultQuestionTimerSeconds ?? 30) || 30),
              ns.shuffleQuestions ? 1 : 0,
              now,
              now,
            ]
          );
        }

        if (!targetSetId) {
          await conn.rollback();
          return { status: 400, payload: { error: 'Kartu soal tujuan (setId) wajib diisi.' } };
        }

        const [maxRows] = await conn.execute(
          'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM soal_questions WHERE set_id = ?',
          [targetSetId]
        );
        let nextOrder = Number(maxRows?.[0]?.max_order || 0);

        for (const item of rawQuestions) {
          nextOrder += 1;
          const qId = String(item?.id || '').trim() || generateId('q');
          const cleanOpts = normalizeOptions(item?.options);
          const correct = Math.min(3, Math.max(0, Number(item?.correctAnswer ?? 0) || 0));
          const timerSeconds = Math.max(0, Number(item?.timerSeconds ?? 30) || 0);
          await conn.execute(
            `INSERT INTO soal_questions (
              id, set_id, sort_order, is_active, question_text, question_image,
              options_json, correct_answer, timer_seconds, explanation, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              qId,
              targetSetId,
              item?.order !== undefined ? Number(item.order) : nextOrder,
              item?.isActive === undefined ? 1 : item.isActive ? 1 : 0,
              String(item?.questionText || '').trim(),
              String(item?.questionImage || '').trim(),
              JSON.stringify(cleanOpts),
              correct,
              timerSeconds,
              String(item?.explanation || '').trim(),
              now,
              now,
            ]
          );
        }

        await conn.execute('UPDATE soal_sets SET updated_at = ? WHERE id = ?', [now, targetSetId]);
        await conn.commit();

        return {
          status: 201,
          payload: { ok: true, setId: targetSetId, count: rawQuestions.length },
        };
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }
    }

    // POST /api/soal/questions -> create single question
    if (cleanMethod === 'POST' && cleanPath === 'questions') {
      const setId = String(body?.setId || '').trim();
      if (!setId) {
        return { status: 400, payload: { error: 'setId wajib diisi.' } };
      }
      const qText = String(body?.questionText || '').trim();
      const qImg = String(body?.questionImage || '').trim();
      if (!qText && !qImg) {
        return { status: 400, payload: { error: 'Pertanyaan harus memiliki teks atau gambar.' } };
      }

      const [maxRows] = await activePool.execute(
        'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM soal_questions WHERE set_id = ?',
        [setId]
      );
      const nextOrder =
        body?.order !== undefined ? Number(body.order) : Number(maxRows?.[0]?.max_order || 0) + 1;
      const qId = String(body?.id || '').trim() || generateId('q');
      const cleanOpts = normalizeOptions(body?.options);
      const correct = Math.min(3, Math.max(0, Number(body?.correctAnswer ?? 0) || 0));
      const timerSeconds = Math.max(0, Number(body?.timerSeconds ?? 30) || 0);
      const explanation = String(body?.explanation || '').trim();
      const isActive = body?.isActive === undefined ? 1 : body.isActive ? 1 : 0;

      await activePool.execute(
        `INSERT INTO soal_questions (
          id, set_id, sort_order, is_active, question_text, question_image,
          options_json, correct_answer, timer_seconds, explanation, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qId,
          setId,
          nextOrder,
          isActive,
          qText,
          qImg,
          JSON.stringify(cleanOpts),
          correct,
          timerSeconds,
          explanation,
          now,
          now,
        ]
      );
      await activePool.execute('UPDATE soal_sets SET updated_at = ? WHERE id = ?', [now, setId]);

      const [rows] = await activePool.execute(
        'SELECT * FROM soal_questions WHERE id = ? LIMIT 1',
        [qId]
      );
      return { status: 201, payload: { question: mapQuestionRow(rows[0]) } };
    }

    // PUT /api/soal/questions/:id
    const qMatch = cleanPath.match(/^questions\/([^/]+)$/);
    if (cleanMethod === 'PUT' && qMatch) {
      const qId = decodeURIComponent(qMatch[1]);
      const [existingRows] = await activePool.execute(
        'SELECT * FROM soal_questions WHERE id = ? LIMIT 1',
        [qId]
      );
      if (!Array.isArray(existingRows) || existingRows.length === 0) {
        return { status: 404, payload: { error: 'Soal tidak ditemukan.' } };
      }
      const existing = mapQuestionRow(existingRows[0]);
      const questionText =
        body?.questionText !== undefined ? String(body.questionText).trim() : existing.questionText;
      const questionImage =
        body?.questionImage !== undefined
          ? String(body.questionImage || '').trim()
          : existing.questionImage || '';
      const options =
        body?.options !== undefined ? normalizeOptions(body.options) : existing.options;
      const correctAnswer =
        body?.correctAnswer !== undefined
          ? Math.min(3, Math.max(0, Number(body.correctAnswer) || 0))
          : existing.correctAnswer;
      const timerSeconds =
        body?.timerSeconds !== undefined
          ? Math.max(0, Number(body.timerSeconds) || 0)
          : existing.timerSeconds;
      const explanation =
        body?.explanation !== undefined
          ? String(body.explanation || '').trim()
          : existing.explanation || '';
      const isActive =
        body?.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.isActive ? 1 : 0;

      await activePool.execute(
        `UPDATE soal_questions
         SET question_text = ?, question_image = ?, options_json = ?, correct_answer = ?,
             timer_seconds = ?, explanation = ?, is_active = ?, updated_at = ?
         WHERE id = ?`,
        [
          questionText,
          questionImage,
          JSON.stringify(options),
          correctAnswer,
          timerSeconds,
          explanation,
          isActive,
          now,
          qId,
        ]
      );
      await activePool.execute('UPDATE soal_sets SET updated_at = ? WHERE id = ?', [
        now,
        existing.setId,
      ]);

      const [updatedRows] = await activePool.execute(
        'SELECT * FROM soal_questions WHERE id = ? LIMIT 1',
        [qId]
      );
      return { status: 200, payload: { question: mapQuestionRow(updatedRows[0]) } };
    }

    // DELETE /api/soal/questions/:id
    if (cleanMethod === 'DELETE' && qMatch) {
      const qId = decodeURIComponent(qMatch[1]);
      await activePool.execute('DELETE FROM soal_questions WHERE id = ?', [qId]);
      return { status: 200, payload: { ok: true } };
    }

    return { status: 404, payload: { error: 'Endpoint Kelola Soal tidak ditemukan.' } };
  } catch (err) {
    const mapped = formatDbError(err);
    return { status: mapped.status, payload: { error: mapped.message, code: mapped.code } };
  }
}
