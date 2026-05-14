const DEFAULT_BPM = 120;

export interface TrackInfo {
  uri: string;
  trackId: string;
  name: string;
  artist: string;
  bpm: number;
  durationMs: number;
  beats?: number[];
}

function extractTrackId(uri: string): string {
  const match = uri.match(/spotify:track:([a-zA-Z0-9]+)/);
  return match ? match[1] : uri;
}

interface AnalysisCache {
  bpm: number;
  beats: number[];
}

const analysisCache = new Map<string, AnalysisCache>();

async function fetchAnalysis(
  trackId: string,
): Promise<AnalysisCache | null> {
  if (!trackId) return null;
  if (analysisCache.has(trackId)) return analysisCache.get(trackId)!;
  try {
    const res = await Spicetify.CosmosAsync.get(
      `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    );
    const beats: number[] = Array.isArray(res?.beats)
      ? res.beats
          .map((b: any) => Math.round((b.start ?? 0) * 1000))
          .filter((ms: number) => Number.isFinite(ms))
      : [];
    const bpm: number =
      typeof res?.track?.tempo === "number" && res.track.tempo > 0
        ? res.track.tempo
        : 0;
    if (beats.length === 0 && bpm === 0) return null;
    const out = { bpm: bpm || DEFAULT_BPM, beats };
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
      const out = { bpm: f.tempo, beats: [] as number[] };
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
