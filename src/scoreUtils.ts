export function getScoreTimestampMs(s: any): number {
  const raw = s?.playedAt || s?.timestamp;
  if (!raw) return 0;
  if (typeof raw?.toMillis === 'function') return raw.toMillis();
  if (typeof raw?.seconds === 'number') return raw.seconds * 1000;
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatScoreTimestamp(s: any): string {
  const ms = getScoreTimestampMs(s);
  if (!ms) return '-';
  return new Date(ms).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getGameScoreStageKey(s: any): string {
  if (s?.stage !== undefined && s?.stage !== null && s?.stage !== '') {
    return `stage-${s.stage}`;
  }
  const title = String(s?.gameTitle || s?.gameId || 'default');
  const stageMatch = title.match(/Stage\s*(\d+)/i);
  if (stageMatch) {
    return `stage-${stageMatch[1]}`;
  }
  return title.trim().toLowerCase();
}

export function dedupeHighestGameScores(scores: any[], excludeAdminPreview = false): any[] {
  const bestMap: Record<string, any> = {};
  scores.forEach((s) => {
    const numericScore = Number(s?.score ?? 0);
    if (numericScore <= 0) return;
    if (excludeAdminPreview && s?.studentId === 'admin-preview') return;

    const studentKey = String(s?.studentId || s?.studentNis || s?.studentName || 'unknown').trim().toLowerCase();
    const gameKey = String(s?.gameId || '').trim().toLowerCase();
    const stageKey = getGameScoreStageKey(s);
    const key = `${studentKey}__${gameKey}__${stageKey}`;

    const existing = bestMap[key];
    const existingScore = Number(existing?.score ?? -1);
    const sTime = getScoreTimestampMs(s);
    const existingTime = existing ? getScoreTimestampMs(existing) : 0;

    if (!existing || numericScore > existingScore || (numericScore === existingScore && sTime > existingTime)) {
      bestMap[key] = s;
    }
  });

  return Object.values(bestMap).sort((a, b) => Number(b?.score ?? 0) - Number(a?.score ?? 0));
}
