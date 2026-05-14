import React from "react";
import { Popup } from "./components/Popup";
import { POPUP_CSS } from "./css/popupStyles";
import { useStore } from "./store";

interface PopoutHandle {
  win: Window;
  close: () => void;
}

let active: PopoutHandle | null = null;

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (opts?: {
        width?: number;
        height?: number;
        disallowReturnToOpener?: boolean;
        preferInitialWindowPlacement?: boolean;
      }) => Promise<Window>;
      window: Window | null;
    };
  }
}

const DRAG_REGION_CSS = `
.osu-drag-region {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 0;
  -webkit-app-region: drag;
  z-index: 99999;
  pointer-events: none;
}
.osu-popup-header { -webkit-app-region: drag; }
.osu-popup-header button { -webkit-app-region: no-drag; }
.osu-canvas, .osu-resize, .osu-popup-actions {
  -webkit-app-region: no-drag;
}
`;

async function openPiP(initW: number, initH: number): Promise<Window | null> {
  const pip = window.documentPictureInPicture;
  if (!pip?.requestWindow) return null;
  try {
    return await pip.requestWindow({
      width: initW,
      height: initH,
      disallowReturnToOpener: true,
      preferInitialWindowPlacement: false,
    });
  } catch (e) {
    console.warn("[Osutify] PiP request failed", e);
    return null;
  }
}

function openFallback(initW: number, initH: number): Window | null {
  return window.open(
    "about:blank",
    "osutify-popout",
    `width=${initW},height=${initH},popup=yes,resizable=yes`,
  );
}

export async function openPopoutWindow(): Promise<void> {
  if (active && !active.win.closed) {
    active.win.focus();
    return;
  }

  const size = useStore.getState().popupSize;
  const initW = Math.max(80, size.w);
  const initH = Math.max(80, size.h);

  const w = (await openPiP(initW, initH)) ?? openFallback(initW, initH);
  if (!w) {
    console.warn("[Osutify] popout failed (PiP + window.open blocked)");
    useStore.getState().setOpen(false);
    return;
  }

  try {
    w.document.title = "Osutify";
    w.document.body.className = "osu-popout-body";

    const style = w.document.createElement("style");
    style.textContent = POPUP_CSS + DRAG_REGION_CSS;
    w.document.head.appendChild(style);

    const container = w.document.createElement("div");
    container.id = "osutify-popout-root";
    w.document.body.appendChild(container);

    const root = (Spicetify as any).ReactDOM.createRoot(container);
    root.render(React.createElement(Popup));

    const persistSize = () => {
      useStore.getState().setPopupSize({
        w: w.innerWidth,
        h: w.innerHeight,
      });
    };
    w.addEventListener("resize", persistSize);

    const handleUnload = () => {
      useStore.getState().setOpen(false);
      active = null;
    };
    w.addEventListener("pagehide", handleUnload);
    w.addEventListener("beforeunload", handleUnload);

    active = {
      win: w,
      close: () => {
        try {
          root.unmount();
        } catch {}
        try {
          w.close();
        } catch {}
        active = null;
      },
    };
  } catch (e) {
    console.error("[Osutify] popout setup failed", e);
    try {
      w.close();
    } catch {}
    useStore.getState().setOpen(false);
  }
}

export function closePopoutWindow(): void {
  if (!active) return;
  active.close();
  active = null;
}
