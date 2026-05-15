import { MapData } from "../game/types";
import { generateAutoMap, DifficultyLevel } from "../game/autoMapper";
import { TrackInfo } from "../spotify/player";

export async function selectMapForTrack(
  track: TrackInfo,
  difficulty: DifficultyLevel = "normal",
): Promise<MapData> {
  console.log(
    "[Osutify] generating map bpm=",
    track.bpm,
    "duration=",
    track.durationMs,
    "beats=",
    track.beats?.length ?? 0,
    "tatums=",
    track.tatums?.length ?? 0,
    "peaks=",
    track.peaks?.length ?? 0,
    "difficulty=",
    difficulty,
  );
  return generateAutoMap({
    trackId: track.trackId,
    title: track.name,
    artist: track.artist,
    bpm: track.bpm,
    durationMs: track.durationMs || 180000,
    beats: track.beats,
    tatums: track.tatums,
    bars: track.bars,
    peaks: track.peaks,
    difficulty,
  });
}
