import sys

with open('src/components/AdminGames.tsx', 'r') as f:
    content = f.read()

target_marker = "/* -------------------------------------------------------------------------\n   Game 5: Petualangan Ke Sekolah (2D Platformer - Mario Style)"
marker_pos = content.find(target_marker)

if marker_pos != -1:
    before = content[:marker_pos]
    
    new_code = '''/* -------------------------------------------------------------------------
   Game 5: Petualangan Ke Sekolah (2D Platformer - Mario Style)
   ------------------------------------------------------------------------- */
const MYSTERY_QUIZZES = [
  {
    q: "Apa fungsi utama dari RAM (Random Access Memory) pada komputer?",
    options: [
      "Menyimpan data sementara yang sedang diproses oleh CPU",
      "Menyimpan file foto dan video secara permanen",
      "Mencetak dokumen langsung ke kertas printer",
      "Menghubungkan komputer ke perangkat bluetooth"
    ],
    correct: 0,
    explanation: "RAM adalah memori kerja kecepatan tinggi yang bersifat sementara (volatile)."
  },
  {
    q: "Langkah-langkah logis dan terstruktur untuk memecahkan masalah dinamakan...",
    options: [
      "Algoritma",
      "Dekomposisi",
      "Pengenalan Pola",
      "Abstraksi"
    ],
    correct: 0,
    explanation: "Algoritma adalah susunan langkah instruksi logis untuk menyelesaikan soal komputasi."
  },
  {
    q: "Teknik memecahkan masalah kompleks menjadi bagian-bagian kecil yang lebih mudah dikelola disebut...",
    options: [
      "Abstraksi",
      "Dekomposisi",
      "Algoritma",
      "Pemrograman"
    ],
    correct: 1,
    explanation: "Dekomposisi memecah masalah besar menjadi modul-modul sederhana."
  },
  {
    q: "Perangkat keras (hardware) yang berfungsi sebagai otak utama pengolah data pada komputer adalah...",
    options: [
      "CPU (Processor)",
      "Harddisk / SSD",
      "Monitor",
      "Power Supply"
    ],
    correct: 0,
    explanation: "CPU (Central Processing Unit) mengeksekusi semua instruksi sistem komputer."
  }
];

function PetualanganSMPGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [distanceRemaining, setDistanceRemaining] = useState(100);

  const [activeQuiz, setActiveQuiz] = useState<{
    quizIdx: number;
    q: string;
    options: string[];
    correct: number;
    explanation: string;
  } | null>(null);

  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({ left: false, right: false, jump: false });

  const engineRef = useRef({
    player: {
      x: 100,
      y: 300,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      isGrounded: false,
      direction: 'right' as 'left' | 'right',
      invulnerableFrames: 0,
      superPowerTimer: 0,
      animFrame: 0,
    },
    cameraX: 0,
    worldWidth: 3200,
    platforms: [
      { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
      { x: 680, y: 380, w: 500, h: 100, type: 'ground' },
      { x: 800, y: 280, w: 120, h: 20, type: 'platform' },
      { x: 980, y: 220, w: 120, h: 20, type: 'platform' },
      { x: 1240, y: 380, w: 700, h: 100, type: 'ground' },
      { x: 1400, y: 270, w: 140, h: 20, type: 'platform' },
      { x: 1600, y: 200, w: 140, h: 20, type: 'platform' },
      { x: 2000, y: 380, w: 1200, h: 100, type: 'ground' },
      { x: 2200, y: 280, w: 160, h: 20, type: 'platform' },
      { x: 2450, y: 240, w: 160, h: 20, type: 'platform' }
    ],
    items: [
      { id: 1, x: 250, y: 330, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
      { id: 2, x: 400, y: 330, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
      { id: 3, x: 550, y: 220, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
      { id: 4, x: 840, y: 240, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
      { id: 5, x: 1020, y: 180, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
      { id: 6, x: 1200, y: 160, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      { id: 7, x: 1450, y: 230, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
      { id: 8, x: 1650, y: 160, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
      { id: 9, x: 1850, y: 150, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
      { id: 10, x: 2250, y: 240, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
      { id: 11, x: 2500, y: 200, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
      { id: 12, x: 2650, y: 180, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
    ],
    obstacles: [
      { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 2, x: 750, y: 345, w: 36, h: 35, type: 'computer_evil', vx: 1.8, minX: 700, maxX: 1100, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 3, x: 1350, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 4, x: 1500, y: 345, w: 36, h: 35, type: 'computer_evil', vx: -2.0, minX: 1300, maxX: 1750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 5, x: 1800, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
      { id: 6, x: 2150, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 7, x: 2350, y: 345, w: 36, h: 35, type: 'computer_evil', vx: 2.2, minX: 2100, maxX: 2600, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
    ],
    schoolGateX: 3000,
  });

  const startGame = () => {
    engineRef.current = {
      player: {
        x: 100,
        y: 300,
        width: 32,
        height: 48,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right',
        invulnerableFrames: 0,
        superPowerTimer: 0,
        animFrame: 0,
      },
      cameraX: 0,
      worldWidth: 3200,
      platforms: [
        { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 680, y: 380, w: 500, h: 100, type: 'ground' },
        { x: 800, y: 280, w: 120, h: 20, type: 'platform' },
        { x: 980, y: 220, w: 120, h: 20, type: 'platform' },
        { x: 1240, y: 380, w: 700, h: 100, type: 'ground' },
        { x: 1400, y: 270, w: 140, h: 20, type: 'platform' },
        { x: 1600, y: 200, w: 140, h: 20, type: 'platform' },
        { x: 2000, y: 380, w: 1200, h: 100, type: 'ground' },
        { x: 2200, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 2450, y: 240, w: 160, h: 20, type: 'platform' }
      ],
      items: [
        { id: 1, x: 250, y: 330, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
        { id: 2, x: 400, y: 330, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
        { id: 3, x: 550, y: 220, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 4, x: 840, y: 240, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
        { id: 5, x: 1020, y: 180, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
        { id: 6, x: 1200, y: 160, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 7, x: 1450, y: 230, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
        { id: 8, x: 1650, y: 160, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
        { id: 9, x: 1850, y: 150, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
        { id: 10, x: 2250, y: 240, w: 26, h: 16, type: 'ram', collected: false, quizIdx: -1 },
        { id: 11, x: 2500, y: 200, w: 26, h: 20, type: 'laptop', collected: false, quizIdx: -1 },
        { id: 12, x: 2650, y: 180, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
      ],
      obstacles: [
        { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 750, y: 345, w: 36, h: 35, type: 'computer_evil', vx: 1.8, minX: 700, maxX: 1100, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1350, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 1500, y: 345, w: 36, h: 35, type: 'computer_evil', vx: -2.0, minX: 1300, maxX: 1750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 1800, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
        { id: 6, x: 2150, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 2350, y: 345, w: 36, h: 35, type: 'computer_evil', vx: 2.2, minX: 2100, maxX: 2600, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 3000,
    };
    setScore(0);
    setLives(3);
    setDistanceRemaining(100);
    setActiveQuiz(null);
    setQuizFeedback(null);
    setGameState('playing');
  };

  const saveFinalScore = async (finalScore: number) => {
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'petualangan-smp',
        gameTitle: 'Petualangan Ke Sekolah',
        studentId: currentStudent?.id || 'admin-preview',
        studentName: currentStudent?.nama || 'Admin Pratinjau',
        studentNis: currentStudent?.nis || '-',
        studentKelas: currentStudent?.kelas || 'Admin',
        score: finalScore,
        playedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  const handleSelectQuizOption = (selectedIdx: number) => {
    if (!activeQuiz || quizFeedback) return;

    if (selectedIdx === activeQuiz.correct) {
      setQuizFeedback({
        isCorrect: true,
        text: '🎉 BENAR! Karakter Menjadi KUAT (Super Power 10 Detik + 200 Poin)!'
      });
      setScore(s => s + 200);
      engineRef.current.player.superPowerTimer = 600;
    } else {
      setQuizFeedback({
        isCorrect: false,
        text: '❌ Jawaban Kurang Tepat! Karakter tidak mendapatkan kekuatan.'
      });
    }

    setTimeout(() => {
      setActiveQuiz(null);
      setQuizFeedback(null);
    }, 1800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        if (!keysRef.current.jump) {
          keysRef.current.jump = true;
        }
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = engineRef.current;

    const gameLoop = () => {
      if (activeQuiz) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const p = engine.player;
      p.animFrame += 0.2;

      if (p.superPowerTimer > 0) {
        p.superPowerTimer--;
      }

      const speedMultiplier = p.superPowerTimer > 0 ? 1.4 : 1.0;

      if (keysRef.current.left) {
        p.vx = -4.5 * speedMultiplier;
        p.direction = 'left';
      } else if (keysRef.current.right) {
        p.vx = 4.5 * speedMultiplier;
        p.direction = 'right';
      } else {
        p.vx *= 0.8;
      }

      if (keysRef.current.jump && p.isGrounded) {
        p.vy = (p.superPowerTimer > 0 ? -14.5 : -12.5);
        p.isGrounded = false;
      }

      p.vy += 0.65;
      if (p.vy > 12) p.vy = 12;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x > engine.worldWidth - p.width) p.x = engine.worldWidth - p.width;

      if (p.invulnerableFrames > 0) p.invulnerableFrames--;

      p.isGrounded = false;
      for (const plat of engine.platforms) {
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.height >= plat.y &&
          p.y + p.height <= plat.y + 20 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
        }
      }

      if (p.y > 480) {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) {
            setGameState('gameover');
            saveFinalScore(score);
          } else {
            p.x = Math.max(100, p.x - 200);
            p.y = 200;
            p.vy = 0;
            p.invulnerableFrames = 60;
          }
          return next;
        });
      }

      for (const item of engine.items) {
        if (!item.collected) {
          if (
            p.x + p.width > item.x &&
            p.x < item.x + item.w &&
            p.y + p.height > item.y &&
            p.y < item.y + item.h
          ) {
            item.collected = true;
            if (item.type === 'ram') {
              setScore(s => s + 100);
            } else if (item.type === 'laptop') {
              setScore(s => s + 50);
            } else if (item.type === 'mystery_box') {
              const quizData = MYSTERY_QUIZZES[item.quizIdx % MYSTERY_QUIZZES.length];
              setActiveQuiz({ quizIdx: item.quizIdx, ...quizData });
            }
          }
        }
      }

      for (const obs of engine.obstacles) {
        if (obs.destroyed) continue;

        if (obs.type === 'computer_evil') {
          obs.x += obs.vx;
          if (obs.x <= obs.minX || obs.x + obs.w >= obs.maxX) {
            obs.vx = -obs.vx;
          }
        } else if (obs.type === 'homework') {
          obs.y += (obs.vy || 2) * (obs.yDir || 1);
          if (obs.y <= (obs.minY || 150) || obs.y + obs.h >= (obs.maxY || 330)) {
            obs.yDir = -(obs.yDir || 1);
          }
        }

        if (
          p.x + p.width - 6 > obs.x &&
          p.x + 6 < obs.x + obs.w &&
          p.y + p.height > obs.y &&
          p.y + 6 < obs.y + obs.h
        ) {
          if (p.superPowerTimer > 0) {
            if (obs.type === 'computer_evil') {
              obs.destroyed = true;
              setScore(s => s + 150);
            }
          } else if (p.invulnerableFrames === 0) {
            p.invulnerableFrames = 60;
            p.vy = -6;
            p.vx = p.direction === 'right' ? -5 : 5;
            setLives(l => {
              const next = l - 1;
              if (next <= 0) {
                setGameState('gameover');
                saveFinalScore(score);
              }
              return next;
            });
          }
        }
      }

      const remainingMeters = Math.max(0, Math.floor((engine.schoolGateX - p.x) / 30));
      setDistanceRemaining(remainingMeters);

      if (p.x >= engine.schoolGateX - 50) {
        const bonusTimeScore = lives * 150 + 200;
        const total = score + bonusTimeScore;
        setScore(total);
        setGameState('win');
        saveFinalScore(total);
        return;
      }

      const targetCamX = p.x - 300;
      engine.cameraX += (targetCamX - engine.cameraX) * 0.1;
      if (engine.cameraX < 0) engine.cameraX = 0;
      if (engine.cameraX > engine.worldWidth - canvas.width) {
        engine.cameraX = engine.worldWidth - canvas.width;
      }

      const camX = engine.cameraX;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#38bdf8');
      skyGradient.addColorStop(0.7, '#bae6fd');
      skyGradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const hillX = i * 400 - camX * 0.2;
        ctx.arc(hillX + 200, 360, 200, Math.PI, 0, false);
      }
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const houseX = i * 500 + 100 - camX * 0.5;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(houseX, 290, 80, 70);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(houseX - 10, 290);
        ctx.lineTo(houseX + 40, 250);
        ctx.lineTo(houseX + 90, 290);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.fillRect(houseX + 30, 320, 20, 40);
      }

      const startHouseX = 50 - camX;
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(startHouseX, 260, 110, 100);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(startHouseX - 15, 260);
      ctx.lineTo(startHouseX + 55, 200);
      ctx.lineTo(startHouseX + 125, 260);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('RUMAH', startHouseX + 30, 240);

      for (const plat of engine.platforms) {
        const px = plat.x - camX;
        if (px + plat.w < -50 || px > canvas.width + 50) continue;

        if (plat.type === 'ground') {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(px, plat.y, plat.w, 15);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px, plat.y + 15, plat.w, plat.h - 15);
          ctx.fillStyle = '#16a34a';
          for (let gx = 0; gx < plat.w; gx += 20) {
            ctx.fillRect(px + gx, plat.y + 12, 10, 5);
          }
        } else {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(px, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 3;
          ctx.strokeRect(px, plat.y, plat.w, plat.h);
        }
      }

      for (const item of engine.items) {
        if (item.collected) continue;
        const ix = item.x - camX;
        if (ix + item.w < -20 || ix > canvas.width + 20) continue;

        const floatY = item.y + Math.sin(p.animFrame * 1.5) * 3;

        if (item.type === 'ram') {
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(ix, floatY, 26, 16);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(ix, floatY + 13, 26, 3);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ix + 3, floatY + 3, 5, 8);
          ctx.fillRect(ix + 10, floatY + 3, 5, 8);
          ctx.fillRect(ix + 17, floatY + 3, 5, 8);
        } else if (item.type === 'laptop') {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(ix, floatY + 4, 26, 16);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ix + 3, floatY + 6, 20, 10);
          ctx.fillStyle = '#475569';
          ctx.fillRect(ix - 2, floatY + 18, 30, 4);
        } else if (item.type === 'mystery_box') {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix, floatY, 30, 30);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3;
          ctx.strokeRect(ix, floatY, 30, 30);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('?', ix + 10, floatY + 22);
        }
      }

      for (const obs of engine.obstacles) {
        if (obs.destroyed) continue;
        const ox = obs.x - camX;
        if (ox + obs.w < -50 || ox > canvas.width + 50) continue;

        if (obs.type === 'computer_evil') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(ox, obs.y, 34, 28);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(ox + 4, obs.y + 4, 26, 18);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox + 8, obs.y + 8, 5, 5);
          ctx.fillRect(ox + 21, obs.y + 8, 5, 5);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ox + 10, obs.y + 16, 14, 3);
          ctx.fillStyle = '#334155';
          ctx.fillRect(ox - 2, obs.y + 28, 38, 7);
        } else if (obs.type === 'puddle') {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(ox + obs.w / 2, obs.y + 8, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'cone') {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(ox + obs.w / 2, obs.y);
          ctx.lineTo(ox, obs.y + obs.h);
          ctx.lineTo(ox + obs.w, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();
        } else if (obs.type === 'homework') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox, obs.y, 26, 30);
          ctx.strokeStyle = '#e2e8f0';
          ctx.strokeRect(ox, obs.y, 26, 30);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('PR', ox + 4, obs.y + 18);
        }
      }

      const gateX = engine.schoolGateX - camX;
      if (gateX > -200 && gateX < canvas.width + 200) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(gateX, 180, 30, 200);
        ctx.fillRect(gateX + 220, 180, 30, 200);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gateX - 10, 160, 270, 35);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('SMPN 1 KAWALI', gateX + 50, 183);

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(gateX + 235, 80, 6, 100);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(gateX + 241, 80, 45, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gateX + 241, 98, 45, 18);
      }

      const px = p.x - camX;
      const py = p.y;

      if (p.invulnerableFrames % 6 < 3) {
        ctx.save();

        if (p.superPowerTimer > 0) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 20;

          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText('⚡ SUPER KUAT ⚡', px - 20, py - 10);
        }

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.direction === 'right' ? px - 6 : px + p.width - 2, py + 12, 10, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 4, py + 12, p.width - 8, 18);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(px + p.width / 2 - 2, py + 14, 4, 10);

        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(px + 4, py + 30, p.width - 8, 10);

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(px + p.width / 2, py + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px + p.width / 2, py + 5, 10, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        const eyeOffsetX = p.direction === 'right' ? 3 : -3;
        ctx.fillRect(px + p.width / 2 + eyeOffsetX, py + 7, 3, 3);

        ctx.fillStyle = '#1e3a8a';
        const legSwing = Math.sin(p.animFrame * 2) * 6;
        ctx.fillRect(px + 6 + legSwing, py + 40, 6, 8);
        ctx.fillRect(px + p.width - 12 - legSwing, py + 40, 6, 8);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, activeQuiz]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 font-black text-rose-500 text-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={cn("transition-all", i < lives ? "opacity-100 scale-100" : "opacity-20 scale-75")}>
                ❤️
              </span>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="text-xs font-bold text-slate-300">
            Jarak: <span className="text-amber-400 font-mono font-black text-sm">{distanceRemaining}m</span> ke SMPN 1 Kawali
          </div>
        </div>

        <div className="flex items-center gap-3">
          {engineRef.current.player.superPowerTimer > 0 && (
            <div className="px-3 py-1 bg-amber-500 text-amber-950 font-black text-xs rounded-xl animate-pulse">
              ⚡ SUPER KUAT ({Math.ceil(engineRef.current.player.superPowerTimer / 60)}s)
            </div>
          )}
          <div className="px-3.5 py-1.5 bg-brand/20 border border-brand/40 text-brand text-xs font-black rounded-xl">
            Skor: {score}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-900 bg-sky-200 shadow-2xl flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={420}
          className="w-full h-[360px] md:h-[420px] object-cover bg-sky-200"
        />

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-lg text-3xl animate-bounce">
              🎒
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Petualangan Ke Sekolah</h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-md font-medium leading-relaxed">
              Bantu <span className="text-amber-400 font-bold">Anak SMP</span> menuju <span className="text-emerald-400 font-bold">SMPN 1 Kawali</span>!
              <br/>Ambil <span className="text-emerald-400 font-bold">RAM (+100)</span> & <span className="text-blue-400 font-bold">Laptop (+50)</span>.
              <br/>Sentuh <span className="text-amber-300 font-bold">Kotak Emas Informatika (?)</span> untuk jawab kuis & menjadi <span className="text-amber-400 font-bold">KUAT</span>! Hancurkan Komputer Jahat!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play size={20} /> Mulai Bermain!
            </button>
          </div>
        )}

        {/* GOLDEN MYSTERY BOX INFORMATIKA QUIZ MODAL */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in zoom-in-95 z-50">
            <div className="max-w-md w-full bg-slate-900 border-2 border-amber-400 p-6 rounded-3xl shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-amber-400 text-amber-950 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black shadow-lg animate-bounce">
                ?
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                  KOTAK EMAS INFORMATIKA
                </span>
                <h3 className="text-sm md:text-base font-extrabold text-white leading-snug">
                  {activeQuiz.q}
                </h3>
              </div>

              <div className="space-y-2 text-left">
                {activeQuiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={!!quizFeedback}
                    onClick={() => handleSelectQuizOption(idx)}
                    className="w-full p-3 bg-slate-800 hover:bg-amber-400 hover:text-amber-950 text-slate-100 rounded-xl font-bold text-xs border border-slate-700 transition-all text-left active:scale-95 disabled:opacity-50"
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className={cn(
                  "p-3 rounded-xl text-xs font-black animate-in fade-in",
                  quizFeedback.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-600 text-white"
                )}>
                  {quizFeedback.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center text-amber-950 text-4xl shadow-2xl animate-bounce">
              🏫
            </div>
            <h2 className="text-3xl font-black text-amber-300">Selamat! Tiba Di Sekolah! 🎉</h2>
            <div className="bg-emerald-900/80 border border-emerald-700 p-4 rounded-2xl">
              <span className="text-xs text-emerald-300 uppercase font-black tracking-widest block">Total Skor Kamu:</span>
              <span className="text-5xl font-black text-amber-400">{score}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-amber-400 text-amber-950 font-black rounded-xl text-sm hover:bg-amber-300 transition-all"
              >
                Main Lagi 🔄
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 border border-rose-500/40 rounded-full flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-rose-400">Terlambat / Kehabisan Nyawa!</h2>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold block">Skor Terkumpul:</span>
              <span className="text-3xl font-black text-white">{score}</span>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 bg-brand text-white font-black rounded-xl text-sm shadow-lg hover:scale-105 transition-all"
            >
              Coba Lagi 🔄
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onMouseDown={() => (keysRef.current.left = true)}
            onMouseUp={() => (keysRef.current.left = false)}
            onTouchStart={() => (keysRef.current.left = true)}
            onTouchEnd={() => (keysRef.current.left = false)}
            className="w-16 h-14 bg-slate-800 hover:bg-slate-700 active:bg-brand text-white font-black text-xl rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform select-none"
          >
            ◀
          </button>
          <button
            onMouseDown={() => (keysRef.current.right = true)}
            onMouseUp={() => (keysRef.current.right = false)}
            onTouchStart={() => (keysRef.current.right = true)}
            onTouchEnd={() => (keysRef.current.right = false)}
            className="w-16 h-14 bg-slate-800 hover:bg-slate-700 active:bg-brand text-white font-black text-xl rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform select-none"
          >
            ▶
          </button>
        </div>

        <div className="text-center hidden sm:block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Status Kontrol</span>
          <span className="text-xs font-semibold text-emerald-400">Panah Kanan / Kiri + Panah Atas</span>
        </div>

        <div>
          <button
            onMouseDown={() => (keysRef.current.jump = true)}
            onMouseUp={() => (keysRef.current.jump = false)}
            onTouchStart={() => (keysRef.current.jump = true)}
            onTouchEnd={() => (keysRef.current.jump = false)}
            className="w-24 h-14 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white font-black text-sm rounded-2xl border border-emerald-500 flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform select-none"
          >
            LOMPAT ▲
          </button>
        </div>
      </div>
    </div>
  );
}
'''

before_code = content[:marker_pos]
with open('src/components/AdminGames.tsx', 'w') as f:
    f.write(before_code + new_code)

print("Update script executed successfully!")
