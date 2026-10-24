declare global {
  type PointerMovement = [x: number, y: number];
  interface TickData {
    deltaTime: number;
    drag_movement: PointerMovement;
  }

  interface WindowEventMap {
    "tick": CustomEvent<TickData>
  }
}

export {};
