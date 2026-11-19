import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeQuestionDocument } from "./server/questionAnalyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy to get correct IP from headers
  app.set('trust proxy', true);

  // Middleware to parse JSON (allow larger base64 document uploads)
  app.use(express.json({ limit: '25mb' }));

  // API Route to analyze uploaded exam/question documents with Gemini
  app.post("/api/analyze-question-doc", async (req, res) => {
    try {
      const { title, fileName, mimeType, fileBase64, sections } = req.body || {};

      if (!fileName || typeof fileName !== 'string') {
        return res.status(400).json({ error: 'Nama file dokumen wajib disertakan.' });
      }
      if (!fileBase64 || typeof fileBase64 !== 'string') {
        return res.status(400).json({ error: 'Isi file dokumen tidak boleh kosong.' });
      }

      const cleanTitle =
        typeof title === 'string' && title.trim()
          ? title.trim()
          : fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');

      const normalizedSections = {
        kisiKisi: Boolean(sections?.kisiKisi),
        materiDariSoal: Boolean(sections?.materiDariSoal),
        penyelesaianRinci: Boolean(sections?.penyelesaianRinci),
        latihanSoal: Boolean(sections?.latihanSoal),
      };

      const result = await analyzeQuestionDocument({
        title: cleanTitle,
        fileName,
        mimeType: typeof mimeType === 'string' ? mimeType : '',
        fileBase64,
        sections: normalizedSections,
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Error analyzing question document:', err);
      const status = typeof err?.status === 'number' ? err.status : 500;
      const rawMessage = err?.message || 'Terjadi kesalahan saat menganalisis dokumen soal.';

      if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('PERMISSION_DENIED') || status === 403) {
        return res.status(403).json({
          error: 'Kunci API Gemini tidak valid atau tidak memiliki izin. Silakan periksa panel Settings > Secrets.',
        });
      }
      if (rawMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
        return res.status(429).json({
          error: 'Kuota permintaan AI sedang penuh (429). Tunggu beberapa saat lalu coba lagi.',
        });
      }
      if (
        status === 503 ||
        status === 504 ||
        rawMessage.includes('UNAVAILABLE') ||
        rawMessage.includes('DEADLINE_EXCEEDED') ||
        rawMessage.includes('high demand')
      ) {
        return res.status(503).json({
          error: 'Layanan AI sedang mengalami lonjakan trafik sementara. Silakan klik Analisis Soal lagi beberapa saat.',
        });
      }
      const clientStatus = status >= 400 && status < 500 ? status : 400;
      return res.status(
        rawMessage.includes('GEMINI_API_KEY') || status >= 500 ? 500 : clientStatus
      ).json({ error: rawMessage });
    }
  });

  // API Route to get client info
  app.get("/api/client-info", (req, res) => {
    // req.ip will use x-forwarded-for if trust proxy is enabled
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Handle potential list in x-forwarded-for if not already handled by req.ip
    const clientIp = Array.isArray(ip) ? ip[0] : (typeof ip === 'string' ? ip.split(',')[0].trim() : ip);

    res.json({
      ip: clientIp,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
