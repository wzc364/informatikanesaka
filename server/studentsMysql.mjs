import crypto from 'crypto';
import {
  callPhpBridge,
  formatDbError,
  getMysqlConfig,
  getPool,
  getSigningSecret,
  isMysqlConfigured,
  isPhpBridgeConfigured,
  verifyAdminToken,
} from './soalMysql.mjs';

const STUDENT_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TAHUN_PELAJARAN = '2025/2026';

let studentsSchemaReady = false;
let studentsSchemaPromise = null;

function slugifyPart(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'default';
}

function buildClassId(kelas, tahunPelajaran) {
  return `cls_${slugifyPart(tahunPelajaran)}_${slugifyPart(kelas)}`;
}

function normalizeJenisKelamin(raw) {
  const val = String(raw || '').trim().toUpperCase();
  if (val.startsWith('P')) return 'P';
  return 'L';
}

function normalizeTahunPelajaran(raw) {
  const clean = String(raw || '').trim();
  return clean || DEFAULT_TAHUN_PELAJARAN;
}

function mapStudentRow(row) {
  const tahunPelajaran = normalizeTahunPelajaran(row.tahun_pelajaran);
  return {
    id: String(row.id),
    nis: String(row.nis || ''),
    nama: String(row.nama || ''),
    jenisKelamin: normalizeJenisKelamin(row.jenis_kelamin),
    kelas: String(row.kelas || ''),
    classId: row.class_id ? String(row.class_id) : buildClassId(row.kelas, tahunPelajaran),
    tahunPelajaran,
    ...(row.avatar_url ? { avatarUrl: String(row.avatar_url) } : {}),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

function mapClassRow(row) {
  return {
    id: String(row.id),
    namaKelas: String(row.nama_kelas || ''),
    tahunPelajaran: normalizeTahunPelajaran(row.tahun_pelajaran),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

function generateStudentId() {
  return `stu_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

async function issueStudentToken(studentId) {
  const secret = await getSigningSecret();
  const payload = Buffer.from(
    JSON.stringify({
      role: 'student',
      studentId: String(studentId),
      exp: Date.now() + STUDENT_TOKEN_TTL_MS,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

async function verifyStudentOrAdminToken(authHeader, targetStudentId) {
  if (await verifyAdminToken(authHeader)) return true;
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
    if (parsed?.role !== 'student' || typeof parsed?.exp !== 'number') return false;
    if (parsed.exp <= Date.now()) return false;
    return String(parsed.studentId || '') === String(targetStudentId || '');
  } catch {
    return false;
  }
}

async function ensureStudentsSchema() {
  const activePool = getPool();
  if (studentsSchemaReady) return activePool;
  if (studentsSchemaPromise) return studentsSchemaPromise;

  studentsSchemaPromise = (async () => {
    await activePool.execute(`
      CREATE TABLE IF NOT EXISTS \`classes\` (
        \`id\` VARCHAR(120) NOT NULL,
        \`nama_kelas\` VARCHAR(100) NOT NULL,
        \`tahun_pelajaran\` VARCHAR(32) NOT NULL DEFAULT '2025/2026',
        \`created_at\` VARCHAR(40) NOT NULL,
        \`updated_at\` VARCHAR(40) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_classes_nama_ta\` (\`nama_kelas\`, \`tahun_pelajaran\`),
        INDEX \`idx_classes_tahun\` (\`tahun_pelajaran\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await activePool.execute(`
      CREATE TABLE IF NOT EXISTS \`students\` (
        \`id\` VARCHAR(120) NOT NULL,
        \`nis\` VARCHAR(64) NOT NULL DEFAULT '',
        \`nama\` VARCHAR(255) NOT NULL,
        \`jenis_kelamin\` VARCHAR(16) NOT NULL DEFAULT 'L',
        \`kelas\` VARCHAR(100) NOT NULL,
        \`class_id\` VARCHAR(120) NULL,
        \`tahun_pelajaran\` VARCHAR(32) NOT NULL DEFAULT '2025/2026',
        \`avatar_url\` LONGTEXT NULL,
        \`created_at\` VARCHAR(40) NOT NULL,
        \`updated_at\` VARCHAR(40) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_students_nis_ta\` (\`nis\`, \`tahun_pelajaran\`),
        INDEX \`idx_students_kelas_ta\` (\`kelas\`, \`tahun_pelajaran\`),
        INDEX \`idx_students_class_id\` (\`class_id\`),
        CONSTRAINT \`fk_students_class\`
          FOREIGN KEY (\`class_id\`) REFERENCES \`classes\` (\`id\`)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    studentsSchemaReady = true;
    return activePool;
  })().catch((err) => {
    studentsSchemaPromise = null;
    throw err;
  });

  return studentsSchemaPromise;
}

async function upsertClassRecord(executor, kelas, tahunPelajaran, now) {
  const cleanKelas = String(kelas || '').trim();
  const cleanTa = normalizeTahunPelajaran(tahunPelajaran);
  if (!cleanKelas) return null;
  const classId = buildClassId(cleanKelas, cleanTa);
  await executor.execute(
    `INSERT INTO classes (id, nama_kelas, tahun_pelajaran, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
    [classId, cleanKelas, cleanTa, now, now]
  );
  const [rows] = await executor.execute(
    'SELECT id FROM classes WHERE nama_kelas = ? AND tahun_pelajaran = ? LIMIT 1',
    [cleanKelas, cleanTa]
  );
  return rows?.[0]?.id ? String(rows[0].id) : classId;
}

async function pruneEmptyClasses(executor) {
  await executor.execute(
    'DELETE FROM classes WHERE id NOT IN (SELECT DISTINCT class_id FROM students WHERE class_id IS NOT NULL)'
  );
}

export async function handleStudentsApiRequest({ method, subPath, body, authHeader }) {
  const cleanMethod = String(method || 'GET').toUpperCase();
  const cleanPath = String(subPath || '').replace(/^\/+|\/+$/g, '');

  // Health check
  if (cleanMethod === 'GET' && cleanPath === 'health') {
    if (!isMysqlConfigured()) {
      return {
        status: 200,
        payload: {
          configured: false,
          connected: false,
          mode: null,
          database: '',
          studentCount: 0,
          classCount: 0,
          message:
            'Koneksi MySQL (nesj8697_digilab) belum dikonfigurasi pada Environment Variables / Secrets.',
        },
      };
    }

    if (isPhpBridgeConfigured()) {
      try {
        const res = await callPhpBridge('students_health');
        return {
          status: 200,
          payload:
            res.status === 200
              ? { ...res.payload, mode: 'php_bridge' }
              : {
                  configured: true,
                  connected: false,
                  mode: 'php_bridge',
                  error: res.payload?.error || 'Gagal mengecek tabel Siswa & Kelas via PHP Bridge.',
                },
        };
      } catch (err) {
        return {
          status: 200,
          payload: {
            configured: true,
            connected: false,
            mode: 'php_bridge',
            error: err?.message || 'Gagal menghubungi PHP Bridge.',
          },
        };
      }
    }

    try {
      const cfg = getMysqlConfig();
      const activePool = await ensureStudentsSchema();
      const [sCnt] = await activePool.execute('SELECT COUNT(*) AS cnt FROM students');
      const [cCnt] = await activePool.execute('SELECT COUNT(*) AS cnt FROM classes');
      return {
        status: 200,
        payload: {
          configured: true,
          connected: true,
          mode: 'direct',
          database: cfg.database,
          studentCount: Number(sCnt?.[0]?.cnt || 0),
          classCount: Number(cCnt?.[0]?.cnt || 0),
        },
      };
    } catch (err) {
      const mapped = formatDbError(err);
      return {
        status: 200,
        payload: {
          configured: true,
          connected: false,
          mode: 'direct',
          error: mapped.message,
          code: mapped.code,
        },
      };
    }
  }

  // Student Login against MySQL students table
  if (cleanMethod === 'POST' && cleanPath === 'login') {
    const nis = String(body?.nis || '').trim();
    const password = String(body?.password || '').trim();
    const tahunPelajaran = normalizeTahunPelajaran(body?.tahunPelajaran);

    if (!nis || !password) {
      return { status: 400, payload: { error: 'Masukkan NISN dan Password.' } };
    }

    if (!isMysqlConfigured()) {
      return {
        status: 200,
        payload: { configured: false, error: 'MySQL belum dikonfigurasi.' },
      };
    }

    if (password !== nis) {
      return {
        status: 401,
        payload: { configured: true, error: 'Login gagal, periksa NISN dan Password Anda.' },
      };
    }

    if (isPhpBridgeConfigured()) {
      try {
        const res = await callPhpBridge('students_login', { nis, tahunPelajaran });
        if (res.status >= 400 || !res.payload?.student) {
          return {
            status: res.status >= 400 ? res.status : 404,
            payload: {
              configured: true,
              code: res.payload?.code || 'NOT_FOUND',
              error: res.payload?.error || 'Akun dengan NISN tersebut tidak ditemukan.',
            },
          };
        }
        const student = res.payload.student;
        const studentToken = await issueStudentToken(student.id);
        return {
          status: 200,
          payload: { configured: true, student, studentToken },
        };
      } catch (err) {
        return {
          status: 502,
          payload: {
            configured: true,
            error: err?.message || 'Gagal memverifikasi login siswa via PHP Bridge.',
          },
        };
      }
    }

    try {
      const activePool = await ensureStudentsSchema();
      const [allMatches] = await activePool.execute(
        'SELECT * FROM students WHERE nis = ? ORDER BY updated_at DESC',
        [nis]
      );
      if (!Array.isArray(allMatches) || allMatches.length === 0) {
        return {
          status: 404,
          payload: {
            configured: true,
            code: 'NOT_FOUND',
            error: 'Akun dengan NISN atau Username tersebut tidak ditemukan.',
          },
        };
      }
      const yearRow = allMatches.find(
        (r) => normalizeTahunPelajaran(r.tahun_pelajaran) === tahunPelajaran
      );
      if (!yearRow) {
        return {
          status: 404,
          payload: {
            configured: true,
            code: 'WRONG_YEAR',
            error: `Akun siswa dengan NISN tersebut tidak terdaftar pada Tahun Pelajaran aktif (${tahunPelajaran}).`,
          },
        };
      }
      const student = mapStudentRow(yearRow);
      const studentToken = await issueStudentToken(student.id);
      return {
        status: 200,
        payload: { configured: true, student, studentToken },
      };
    } catch (err) {
      const mapped = formatDbError(err);
      return { status: mapped.status, payload: { configured: true, error: mapped.message } };
    }
  }

  // Student Avatar Update (allowed for matching student token OR admin token)
  if (cleanMethod === 'POST' && cleanPath === 'avatar') {
    const studentId = String(body?.studentId || '').trim();
    const avatarUrl = String(body?.avatarUrl || '').trim();
    if (!studentId || !avatarUrl) {
      return { status: 400, payload: { error: 'studentId dan avatarUrl wajib diisi.' } };
    }

    if (!isMysqlConfigured()) {
      return { status: 503, payload: { configured: false, error: 'MySQL belum dikonfigurasi.' } };
    }

    const authorized = await verifyStudentOrAdminToken(authHeader, studentId);
    if (!authorized) {
      return {
        status: 401,
        payload: { error: 'Sesi siswa tidak valid untuk mengubah foto profil.' },
      };
    }

    const now = new Date().toISOString();
    if (isPhpBridgeConfigured()) {
      try {
        const res = await callPhpBridge('students_avatar', { studentId, avatarUrl });
        if (res.status >= 400) {
          return { status: res.status, payload: res.payload };
        }
        return { status: 200, payload: { ok: true, avatarUrl } };
      } catch (err) {
        return { status: 502, payload: { error: err?.message || 'Gagal memperbarui avatar via PHP Bridge.' } };
      }
    }

    try {
      const activePool = await ensureStudentsSchema();
      await activePool.execute('UPDATE students SET avatar_url = ?, updated_at = ? WHERE id = ?', [
        avatarUrl,
        now,
        studentId,
      ]);
      return { status: 200, payload: { ok: true, avatarUrl } };
    } catch (err) {
      const mapped = formatDbError(err);
      return { status: mapped.status, payload: { error: mapped.message } };
    }
  }

  // GET /api/students -> list all students & classes
  if (cleanMethod === 'GET' && cleanPath === '') {
    if (!isMysqlConfigured()) {
      return {
        status: 200,
        payload: {
          configured: false,
          students: [],
          classes: [],
        },
      };
    }

    if (isPhpBridgeConfigured()) {
      try {
        const res = await callPhpBridge('students_list');
        if (res.status >= 400) {
          return {
            status: res.status,
            payload: {
              configured: true,
              students: [],
              classes: [],
              error: res.payload?.error || 'Gagal memuat data Siswa & Kelas dari PHP Bridge.',
            },
          };
        }
        return {
          status: 200,
          payload: {
            configured: true,
            students: Array.isArray(res.payload?.students) ? res.payload.students : [],
            classes: Array.isArray(res.payload?.classes) ? res.payload.classes : [],
          },
        };
      } catch (err) {
        return {
          status: 502,
          payload: {
            configured: true,
            students: [],
            classes: [],
            error: err?.message || 'Gagal menghubungi PHP Bridge.',
          },
        };
      }
    }

    try {
      const activePool = await ensureStudentsSchema();
      const [sRows] = await activePool.execute(
        'SELECT * FROM students ORDER BY kelas ASC, nama ASC'
      );
      const [cRows] = await activePool.execute(
        'SELECT * FROM classes ORDER BY tahun_pelajaran DESC, nama_kelas ASC'
      );
      return {
        status: 200,
        payload: {
          configured: true,
          students: Array.isArray(sRows) ? sRows.map(mapStudentRow) : [],
          classes: Array.isArray(cRows) ? cRows.map(mapClassRow) : [],
        },
      };
    } catch (err) {
      const mapped = formatDbError(err);
      return {
        status: mapped.status,
        payload: {
          configured: true,
          students: [],
          classes: [],
          error: mapped.message,
          code: mapped.code,
        },
      };
    }
  }

  // All Admin CRUD / Migration routes require verified Admin Bearer token
  if (!(await verifyAdminToken(authHeader))) {
    return {
      status: 401,
      payload: {
        error: 'Sesi admin MySQL belum terverifikasi. Masukkan passcode admin untuk mengelola data Siswa & Kelas.',
        code: 'ADMIN_UNAUTHORIZED',
      },
    };
  }

  if (!isMysqlConfigured()) {
    return {
      status: 503,
      payload: {
        error: 'Database MySQL (nesj8697_digilab) belum dikonfigurasi.',
        code: 'MYSQL_NOT_CONFIGURED',
      },
    };
  }

  // Delegate admin writes to PHP Bridge if configured
  if (isPhpBridgeConfigured()) {
    try {
      const studentMatch = cleanPath.match(/^([^/]+)$/);
      if (cleanMethod === 'POST' && cleanPath === '') {
        return await callPhpBridge('students_create', body || {});
      }
      if (cleanMethod === 'POST' && cleanPath === 'bulk') {
        return await callPhpBridge('students_bulk_upsert', body || {});
      }
      if (cleanMethod === 'POST' && cleanPath === 'bulk-delete') {
        return await callPhpBridge('students_bulk_delete', body || {});
      }
      if (cleanMethod === 'PUT' && studentMatch) {
        return await callPhpBridge('students_update', {
          ...(body || {}),
          id: decodeURIComponent(studentMatch[1]),
        });
      }
      if (cleanMethod === 'DELETE' && studentMatch) {
        return await callPhpBridge('students_delete', {
          id: decodeURIComponent(studentMatch[1]),
        });
      }
      return { status: 404, payload: { error: 'Endpoint Siswa & Kelas tidak ditemukan.' } };
    } catch (err) {
      return {
        status: 502,
        payload: { error: err?.message || 'Gagal menghubungi PHP Bridge.' },
      };
    }
  }

  // Direct MySQL Admin CRUD
  try {
    const activePool = await ensureStudentsSchema();
    const now = new Date().toISOString();

    // POST /api/students -> create single student
    if (cleanMethod === 'POST' && cleanPath === '') {
      const nis = String(body?.nis || '').trim();
      const nama = String(body?.nama || '').trim();
      const kelas = String(body?.kelas || '').trim();
      if (!nama || !kelas) {
        return { status: 400, payload: { error: 'Nama siswa dan kelas wajib diisi.' } };
      }
      const jenisKelamin = normalizeJenisKelamin(body?.jenisKelamin);
      const tahunPelajaran = normalizeTahunPelajaran(body?.tahunPelajaran);
      const avatarUrl = body?.avatarUrl ? String(body.avatarUrl).trim() : null;
      const id = String(body?.id || '').trim() || generateStudentId();

      const conn = await activePool.getConnection();
      try {
        await conn.beginTransaction();
        const classId = await upsertClassRecord(conn, kelas, tahunPelajaran, now);
        await conn.execute(
          `INSERT INTO students (
            id, nis, nama, jenis_kelamin, kelas, class_id, tahun_pelajaran, avatar_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, nis, nama, jenisKelamin, kelas, classId, tahunPelajaran, avatarUrl, now, now]
        );
        await conn.commit();
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }

      const [rows] = await activePool.execute('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
      return { status: 201, payload: { student: mapStudentRow(rows[0]) } };
    }

    // POST /api/students/bulk -> batch upsert (Excel import / TA copy / Firestore migration)
    if (cleanMethod === 'POST' && cleanPath === 'bulk') {
      const rawList = Array.isArray(body?.students) ? body.students : [];
      if (rawList.length === 0) {
        return { status: 400, payload: { error: 'Daftar siswa tidak boleh kosong.' } };
      }

      const conn = await activePool.getConnection();
      let count = 0;
      try {
        await conn.beginTransaction();
        const classCache = new Map();

        for (const item of rawList) {
          const nis = String(item?.nis || '').trim();
          const nama = String(item?.nama || '').trim();
          const kelas = String(item?.kelas || '').trim() || 'Umum';
          if (!nis && !nama) continue;

          const jenisKelamin = normalizeJenisKelamin(item?.jenisKelamin);
          const tahunPelajaran = normalizeTahunPelajaran(item?.tahunPelajaran);
          const avatarUrl = item?.avatarUrl ? String(item.avatarUrl).trim() : null;
          const id = String(item?.id || '').trim() || generateStudentId();

          const classKey = `${tahunPelajaran}::${kelas}`;
          let classId = classCache.get(classKey);
          if (!classId) {
            classId = await upsertClassRecord(conn, kelas, tahunPelajaran, now);
            classCache.set(classKey, classId);
          }

          await conn.execute(
            `INSERT INTO students (
              id, nis, nama, jenis_kelamin, kelas, class_id, tahun_pelajaran, avatar_url, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              nis = VALUES(nis),
              nama = VALUES(nama),
              jenis_kelamin = VALUES(jenis_kelamin),
              kelas = VALUES(kelas),
              class_id = VALUES(class_id),
              tahun_pelajaran = VALUES(tahun_pelajaran),
              avatar_url = COALESCE(VALUES(avatar_url), avatar_url),
              updated_at = VALUES(updated_at)`,
            [id, nis, nama || nis, jenisKelamin, kelas, classId, tahunPelajaran, avatarUrl, now, now]
          );
          count++;
        }

        await conn.commit();
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }

      const [sCnt] = await activePool.execute('SELECT COUNT(*) AS cnt FROM students');
      const [cCnt] = await activePool.execute('SELECT COUNT(*) AS cnt FROM classes');
      return {
        status: 201,
        payload: {
          ok: true,
          processed: count,
          totalStudents: Number(sCnt?.[0]?.cnt || 0),
          totalClasses: Number(cCnt?.[0]?.cnt || 0),
        },
      };
    }

    // POST /api/students/bulk-delete -> delete multiple students
    if (cleanMethod === 'POST' && cleanPath === 'bulk-delete') {
      const ids = Array.isArray(body?.ids)
        ? body.ids.map((v) => String(v || '').trim()).filter(Boolean)
        : [];
      if (ids.length === 0) {
        return { status: 400, payload: { error: 'Daftar ID siswa wajib diisi.' } };
      }

      const conn = await activePool.getConnection();
      try {
        await conn.beginTransaction();
        const placeholders = ids.map(() => '?').join(', ');
        await conn.execute(`DELETE FROM students WHERE id IN (${placeholders})`, ids);
        await pruneEmptyClasses(conn);
        await conn.commit();
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }

      return { status: 200, payload: { ok: true, deleted: ids.length } };
    }

    // PUT /api/students/:id -> update student
    const studentMatch = cleanPath.match(/^([^/]+)$/);
    if (cleanMethod === 'PUT' && studentMatch) {
      const studentId = decodeURIComponent(studentMatch[1]);
      const [existingRows] = await activePool.execute(
        'SELECT * FROM students WHERE id = ? LIMIT 1',
        [studentId]
      );
      if (!Array.isArray(existingRows) || existingRows.length === 0) {
        return { status: 404, payload: { error: 'Data siswa tidak ditemukan.' } };
      }
      const existing = mapStudentRow(existingRows[0]);
      const nis = body?.nis !== undefined ? String(body.nis).trim() : existing.nis;
      const nama = body?.nama !== undefined ? String(body.nama).trim() : existing.nama;
      const kelas = body?.kelas !== undefined ? String(body.kelas).trim() : existing.kelas;
      if (!nama || !kelas) {
        return { status: 400, payload: { error: 'Nama siswa dan kelas tidak boleh kosong.' } };
      }
      const jenisKelamin =
        body?.jenisKelamin !== undefined
          ? normalizeJenisKelamin(body.jenisKelamin)
          : existing.jenisKelamin;
      const tahunPelajaran =
        body?.tahunPelajaran !== undefined
          ? normalizeTahunPelajaran(body.tahunPelajaran)
          : existing.tahunPelajaran;
      const avatarUrl =
        body?.avatarUrl !== undefined
          ? body.avatarUrl
            ? String(body.avatarUrl).trim()
            : null
          : existing.avatarUrl || null;

      const conn = await activePool.getConnection();
      try {
        await conn.beginTransaction();
        const classId = await upsertClassRecord(conn, kelas, tahunPelajaran, now);
        await conn.execute(
          `UPDATE students
           SET nis = ?, nama = ?, jenis_kelamin = ?, kelas = ?, class_id = ?, tahun_pelajaran = ?, avatar_url = ?, updated_at = ?
           WHERE id = ?`,
          [nis, nama, jenisKelamin, kelas, classId, tahunPelajaran, avatarUrl, now, studentId]
        );
        await pruneEmptyClasses(conn);
        await conn.commit();
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }

      const [updatedRows] = await activePool.execute(
        'SELECT * FROM students WHERE id = ? LIMIT 1',
        [studentId]
      );
      return { status: 200, payload: { student: mapStudentRow(updatedRows[0]) } };
    }

    // DELETE /api/students/:id -> delete single student
    if (cleanMethod === 'DELETE' && studentMatch) {
      const studentId = decodeURIComponent(studentMatch[1]);
      const conn = await activePool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute('DELETE FROM students WHERE id = ?', [studentId]);
        await pruneEmptyClasses(conn);
        await conn.commit();
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }
      return { status: 200, payload: { ok: true } };
    }

    return { status: 404, payload: { error: 'Endpoint Siswa & Kelas tidak ditemukan.' } };
  } catch (err) {
    const mapped = formatDbError(err);
    return { status: mapped.status, payload: { error: mapped.message, code: mapped.code } };
  }
}
