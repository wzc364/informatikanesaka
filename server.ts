import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { processAnalyzeQuestionRequest } from "./server/questionAnalyzer.mjs";
import { processGenerateQuestionsRequest } from "./server/questionGenerator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      const p = Number(args[i + 1]);
      if (Number.isFinite(p) && p > 0) return p;
    }
    if (args[i].startsWith('--port=')) {
      const p = Number(args[i].slice('--port='.length));
      if (Number.isFinite(p) && p > 0) return p;
    }
  }
  return Number(process.env.PORT) || 3000;
}

async function startServer() {
  const app = express();
  const PORT = resolvePort();

  // Trust proxy to get correct IP from headers
  app.set('trust proxy', true);

  // Middleware to parse JSON (allow larger base64 document uploads)
  app.use(express.json({ limit: '25mb' }));

  // API Route to analyze uploaded exam/question documents with Gemini
  app.post("/api/analyze-question-doc", async (req, res) => {
    const { status, payload } = await processAnalyzeQuestionRequest(req.body);
    return res.status(status).json(payload);
  });

  // API Route to generate multiple-choice questions with Gemini AI
  app.post("/api/generate-questions", async (req, res) => {
    const { status, payload } = await processGenerateQuestionsRequest(req.body);
    return res.status(status).json(payload);
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

  // Ensure unmatched /api/* routes return JSON instead of HTML fallback
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Endpoint API tidak ditemukan." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
