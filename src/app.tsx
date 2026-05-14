import { useStore } from "./store";
import { getCurrentTrackAsync, onSongChange } from "./spotify/player";
import { selectMapForTrack } from "./maps/selector";
import { openPopoutWindow, closePopoutWindow } from "./popout";

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

async function refreshMapForCurrentTrack(): Promise<void> {
  const track = await getCurrentTrackAsync();
  console.log("[SpotifyOsu] refresh track", track);
  useStore.getState().setTrack(track);
  if (!track) {
    useStore.getState().setMap(null);
    return;
  }
  try {
    const map = await selectMapForTrack(track);
    console.log(
      "[SpotifyOsu] map ready",
      map.title,
      "notes:",
      map.notes.length,
      "bpm:",
      map.bpm,
    );
    useStore.getState().setMap(map);
  } catch (e) {
    console.error("[SpotifyOsu] map load failed", e);
    useStore.getState().setMap(null);
  }
}

async function main(): Promise<void> {
  await waitForSpicetify();

  const button = new Spicetify.Playbar.Button(
    "SpotifyOsu",
    "gamepad",
    () => {
      useStore.getState().toggleOpen();
    },
    false,
    useStore.getState().open,
  );
  button.register();

  let lastOpen = useStore.getState().open;
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
  });

  onSongChange(() => {
    void refreshMapForCurrentTrack();
  });

  await refreshMapForCurrentTrack();

  Spicetify.showNotification("SpotifyOsu ready");
}

export default main;
