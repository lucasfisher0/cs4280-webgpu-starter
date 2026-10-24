
let currTime: number | null = null;
declare global {

  function getDeltaTime(): number {
    const oldTime = currTime;
    currTime = performance.now();
    return !oldTime ? 0.0 : (currTime - oldTime) * 0.001;
  }

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
