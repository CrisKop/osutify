import { MapData } from "../game/types";
import { generateAutoMap } from "../game/autoMapper";
import { TrackInfo } from "../spotify/player";

export async function selectMapForTrack(
  track: TrackInfo,
): Promise<MapData> {
  console.log(
    "[Osutify] generating map bpm=",
    track.bpm,
    "duration=",
    track.durationMs,
    "realBeats=",
    track.beats?.length ?? 0,
  );
  return generateAutoMap({
    trackId: track.trackId,
    title: track.name,
    artist: track.artist,
    bpm: track.bpm,
    durationMs: track.durationMs || 180000,
    beats: track.beats,
  });
}
