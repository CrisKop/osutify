export interface PointerEventData {
  x: number;
  y: number;
}

export type PointerCb = (e: PointerEventData) => void;

const KEYS = new Set(["KeyZ", "KeyX"]);

export class InputHandler {
  private listeners: {
    down: PointerCb[];
    up: PointerCb[];
    move: PointerCb[];
  } = { down: [], up: [], move: [] };
  private pointerActive = false;
  private keysHeld = new Set<string>();
  private lastPos: PointerEventData = { x: 0.5, y: 0.5 };
  private hasPointer = false;
  private disposed = false;
  private win: Window;

  constructor(private element: HTMLElement) {
    this.win = element.ownerDocument?.defaultView ?? window;
    element.addEventListener("pointerdown", this.handleDown);
    element.addEventListener("pointerup", this.handleUp);
    element.addEventListener("pointercancel", this.handleUp);
    element.addEventListener("pointermove", this.handleMove);
    element.addEventListener("pointerenter", this.handleEnter);
    element.addEventListener("pointerleave", this.handleLeave);
    element.addEventListener("contextmenu", this.preventCtx);
    this.win.addEventListener("keydown", this.handleKeyDown);
    this.win.addEventListener("keyup", this.handleKeyUp);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.element.removeEventListener("pointerdown", this.handleDown);
    this.element.removeEventListener("pointerup", this.handleUp);
    this.element.removeEventListener("pointercancel", this.handleUp);
    this.element.removeEventListener("pointermove", this.handleMove);
    this.element.removeEventListener("pointerenter", this.handleEnter);
    this.element.removeEventListener("pointerleave", this.handleLeave);
    this.element.removeEventListener("contextmenu", this.preventCtx);
    this.win.removeEventListener("keydown", this.handleKeyDown);
    this.win.removeEventListener("keyup", this.handleKeyUp);
  }

  onDown(cb: PointerCb): void {
    this.listeners.down.push(cb);
  }
  onUp(cb: PointerCb): void {
    this.listeners.up.push(cb);
  }
  onMove(cb: PointerCb): void {
    this.listeners.move.push(cb);
  }

  isHeld(): boolean {
    return this.pointerActive || this.keysHeld.size > 0;
  }

  getCursor(): PointerEventData | null {
    return this.hasPointer ? this.lastPos : null;
  }

  private preventCtx = (e: Event) => e.preventDefault();

  private toRelative(e: PointerEvent): PointerEventData {
    const rect = this.element.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  private fire(list: PointerCb[], data: PointerEventData): void {
    for (const cb of list) cb(data);
  }

  private handleDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.pointerActive = true;
    this.element.setPointerCapture?.(e.pointerId);
    const data = this.toRelative(e);
    this.lastPos = data;
    this.hasPointer = true;
    this.fire(this.listeners.down, data);
  };

  private handleUp = (e: PointerEvent) => {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    const data = this.toRelative(e);
    this.lastPos = data;
    if (this.keysHeld.size === 0) {
      this.fire(this.listeners.up, data);
    }
  };

  private handleMove = (e: PointerEvent) => {
    const data = this.toRelative(e);
    this.lastPos = data;
    this.hasPointer = true;
    this.fire(this.listeners.move, data);
  };

  private handleEnter = (e: PointerEvent) => {
    this.hasPointer = true;
    this.lastPos = this.toRelative(e);
  };

  private handleLeave = () => {
    this.hasPointer = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!KEYS.has(e.code)) return;
    if (e.repeat) return;
    if (!this.hasPointer) return;
    const wasHeld = this.keysHeld.size > 0 || this.pointerActive;
    this.keysHeld.add(e.code);
    e.preventDefault();
    if (!wasHeld) {
      this.fire(this.listeners.down, this.lastPos);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (!KEYS.has(e.code)) return;
    if (!this.keysHeld.has(e.code)) return;
    this.keysHeld.delete(e.code);
    if (this.keysHeld.size === 0 && !this.pointerActive) {
      this.fire(this.listeners.up, this.lastPos);
    }
  };
}
