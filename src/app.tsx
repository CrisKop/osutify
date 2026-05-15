import { useStore } from "./store";
import { getCurrentTrackAsync, onSongChange, TrackInfo } from "./spotify/player";
import { selectMapForTrack } from "./maps/selector";
import { openPopoutWindow, closePopoutWindow } from "./popout";
import { extractColorsFromImage } from "./spotify/colorExtract";

async function waitForSpicetify(): Promise<void> {
  while (
    !Spicetify?.showNotification ||
    !Spicetify?.Player ||
    !Spicetify?.Playbar?.Button ||
    !(Spicetify as any).ReactDOM?.createRoot
  ) {
    await new Promise((r) => setTimeout(r, 200));
  }
  let tries = 0;
  while (!Spicetify.Player.data?.item && tries < 50) {
    await new Promise((r) => setTimeout(r, 200));
    tries++;
  }
}

async function refreshAlbumColors(track: TrackInfo): Promise<void> {
  try {
    const c: any = await Spicetify.colorExtractor(track.uri);
    if (c && typeof c.VIBRANT === "string") {
      console.log("[Osutify] colors via Spicetify API", c);
      useStore.getState().setAlbumColors({
        vibrant: c.VIBRANT ?? c.PROMINENT ?? "#f0ffbc",
        darkVibrant: c.DARK_VIBRANT ?? "#1e2a31",
        lightVibrant: c.LIGHT_VIBRANT ?? c.VIBRANT ?? "#bcfffc",
        prominent: c.PROMINENT ?? c.VIBRANT ?? "#dbdd78",
        desaturated: c.DESATURATED ?? "#bebfab",
      });
      return;
    }
  } catch (e) {
    console.warn("[Osutify] colorExtractor API failed, fallback to canvas", e);
  }

  if (!track.imageUrl) {
    console.warn("[Osutify] no album image URL — colors unavailable");
    return;
  }
  const colors = await extractColorsFromImage(track.imageUrl);
  if (colors) {
    console.log("[Osutify] colors via canvas", colors);
    useStore.getState().setAlbumColors(colors);
  } else {
    console.warn("[Osutify] canvas extract returned null");
  }
}

async function refreshMapForCurrentTrack(): Promise<void> {
  const track = await getCurrentTrackAsync();
  console.log("[Osutify] refresh track", track);
  useStore.getState().setTrack(track);
  if (!track) {
    useStore.getState().setMap(null);
    useStore.getState().setAlbumColors(null);
    return;
  }
  void refreshAlbumColors(track);
  try {
    const difficulty = useStore.getState().difficulty;
    const map = await selectMapForTrack(track, difficulty);
    console.log(
      "[Osutify] map ready",
      map.title,
      "notes:",
      map.notes.length,
      "bpm:",
      map.bpm,
    );
    useStore.getState().setMap(map);
  } catch (e) {
    console.error("[Osutify] map load failed", e);
    useStore.getState().setMap(null);
  }
}

async function regenerateMapKeepTrack(): Promise<void> {
  const track = useStore.getState().track;
  if (!track) {
    await refreshMapForCurrentTrack();
    return;
  }
  try {
    const difficulty = useStore.getState().difficulty;
    const map = await selectMapForTrack(track, difficulty);
    console.log(
      "[Osutify] map regenerated",
      map.title,
      "notes:",
      map.notes.length,
    );
    useStore.getState().setMap(map);
    useStore.getState().resetScore();
  } catch (e) {
    console.error("[Osutify] regen failed", e);
  }
}

async function main(): Promise<void> {
  await waitForSpicetify();

  const OSUTIFY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3.25" y="0.5" width="1.5" height="5" rx="0.75" transform="rotate(-25 4 3)"/><rect x="7.25" y="0.5" width="1.5" height="5" rx="0.75"/><rect x="11.25" y="0.5" width="1.5" height="5" rx="0.75" transform="rotate(25 12 3)"/><path fill-rule="evenodd" d="M8 7.4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6zm0 1.7a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z"/></svg>`;

  const button = new Spicetify.Playbar.Button(
    "Osutify",
    OSUTIFY_ICON,
    () => {
      useStore.getState().toggleOpen();
    },
    false,
    useStore.getState().open,
  );
  button.register();

  let lastOpen = useStore.getState().open;
  let lastDifficulty = useStore.getState().difficulty;
  useStore.subscribe((s) => {
    button.active = s.open;
    if (s.open !== lastOpen) {
      lastOpen = s.open;
      if (s.open) {
        void openPopoutWindow();
        if (!s.map) void refreshMapForCurrentTrack();
      } else {
        closePopoutWindow();
      }
    }
    if (s.difficulty !== lastDifficulty) {
      lastDifficulty = s.difficulty;
      void regenerateMapKeepTrack();
    }
  });

  onSongChange(() => {
    void refreshMapForCurrentTrack();
  });

  await refreshMapForCurrentTrack();

  Spicetify.showNotification("Osutify ready");
}

export default main;
