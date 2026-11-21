
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

  // Fixed length tuple pattern
  type Tuple<T, N extends number, R extends unknown[] = []>
    = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;
}

export {};
