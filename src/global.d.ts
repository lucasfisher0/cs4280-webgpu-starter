
// Tick
declare global {
  type PointerPosition = [x: number, y: number];
  interface TickData {
    deltaTime: number;
    drag_movement: PointerPosition;
  }

  interface WindowEventMap {
    "tick": CustomEvent<TickData>
  }
}

export {};
