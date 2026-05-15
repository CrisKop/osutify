const DEFAULT_BPM = 120;

export interface LoudPeak {
  time: number;
  loudness: number;
}

export interface TrackInfo {
  uri: string;
  trackId: string;
  name: string;
  artist: string;
  bpm: number;
  durationMs: number;
  beats?: number[];
  tatums?: number[];
  bars?: number[];
  peaks?: LoudPeak[];
}

function extractTrackId(uri: string): string {
  const match = uri.match(/spotify:track:([a-zA-Z0-9]+)/);
  return match ? match[1] : uri;
}

interface AnalysisCache {
  bpm: number;
  beats: number[];
  tatums: number[];
  bars: number[];
  peaks: LoudPeak[];
}

const analysisCache = new Map<string, AnalysisCache>();

function timesFrom(arr: any[]): number[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((b: any) => Math.round((b.start ?? 0) * 1000))
    .filter((ms: number) => Number.isFinite(ms));
}

function extractPeaks(segments: any[]): LoudPeak[] {
  if (!Array.isArray(segments) || segments.length === 0) return [];
  const out: LoudPeak[] = [];
  for (const s of segments) {
    const t = Math.round((s.start ?? 0) * 1000);
    const l = typeof s.loudness_max === "number" ? s.loudness_max : -60;
    if (Number.isFinite(t)) out.push({ time: t, loudness: l });
  }
  if (out.length === 0) return out;
  const vals = out.map((p) => p.loudness).sort((a, b) => a - b);
  const cutoff = vals[Math.floor(vals.length * 0.55)];
  return out.filter((p) => p.loudness >= cutoff);
}

async function fetchAnalysis(
  trackId: string,
): Promise<AnalysisCache | null> {
  if (!trackId) return null;
  if (analysisCache.has(trackId)) return analysisCache.get(trackId)!;
  try {
    const res = await Spicetify.CosmosAsync.get(
      `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    );
    const beats = timesFrom(res?.beats);
    const tatums = timesFrom(res?.tatums);
    const bars = timesFrom(res?.bars);
    const peaks = extractPeaks(res?.segments);
    const bpm: number =
      typeof res?.track?.tempo === "number" && res.track.tempo > 0
        ? res.track.tempo
        : 0;
    if (beats.length === 0 && bpm === 0) return null;
    const out: AnalysisCache = {
      bpm: bpm || DEFAULT_BPM,
      beats,
      tatums,
      bars,
      peaks,
    };
    analysisCache.set(trackId, out);
    return out;
  } catch (e) {
    console.warn("[Osutify] audio-analysis fetch failed", e);
  }
  try {
    const f = await Spicetify.CosmosAsync.get(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
    );
    if (typeof f?.tempo === "number" && f.tempo > 0) {
      const out: AnalysisCache = {
        bpm: f.tempo,
        beats: [],
        tatums: [],
        bars: [],
        peaks: [],
      };
      analysisCache.set(trackId, out);
      return out;
    }
  } catch (e) {
    console.warn("[Osutify] audio-features fallback failed", e);
  }
  return null;
}

function readSync(): TrackInfo | null {
  if (typeof Spicetify === "undefined" || !Spicetify.Player?.data?.item) {
    return null;
  }
  const item = Spicetify.Player.data.item;
  const meta = item.metadata ?? ({} as Record<string, string>);
  const tempoRaw = meta["audio-attributes.tempo"] ?? (meta as any)["tempo"];
  const tempo = tempoRaw ? parseFloat(tempoRaw) : NaN;
  const artistName =
    item.artists?.[0]?.name ??
    (meta as any).artist_name ??
    (meta as any).artist ??
    "Unknown";

  return {
    uri: item.uri,
    trackId: extractTrackId(item.uri),
    name: item.name ?? "Unknown",
    artist: artistName,
    bpm: Number.isFinite(tempo) && tempo > 0 ? tempo : DEFAULT_BPM,
    durationMs: item.duration?.milliseconds ?? 0,
  };
}

export function getCurrentTrack(): TrackInfo | null {
  return readSync();
}

export async function getCurrentTrackAsync(): Promise<TrackInfo | null> {
  const info = readSync();
  if (!info) return null;
  const analysis = await fetchAnalysis(info.trackId);
  if (analysis) {
    info.bpm = analysis.bpm;
    if (analysis.beats.length > 0) info.beats = analysis.beats;
    if (analysis.tatums.length > 0) info.tatums = analysis.tatums;
    if (analysis.bars.length > 0) info.bars = analysis.bars;
    if (analysis.peaks.length > 0) info.peaks = analysis.peaks;
  }
  return info;
}

export function getProgressMs(): number {
  try {
    return Spicetify.Player.getProgress();
  } catch {
    return 0;
  }
}

export function isPlaying(): boolean {
  try {
    return Spicetify.Player.isPlaying();
  } catch {
    return false;
  }
}

export function onSongChange(cb: () => void): () => void {
  const handler = () => cb();
  Spicetify.Player.addEventListener("songchange", handler);
  return () => Spicetify.Player.removeEventListener("songchange", handler);
}

export function onPlayPause(cb: () => void): () => void {
  const handler = () => cb();
  Spicetify.Player.addEventListener("onplaypause", handler);
  return () => Spicetify.Player.removeEventListener("onplaypause", handler);
}

export { extractTrackId };
