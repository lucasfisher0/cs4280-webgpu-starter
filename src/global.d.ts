
// CSS Imports
declare module "*.css" {}

// If you use CSS Modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Image Imports
declare module "*.svg" {}
declare module "*.png" {}
declare module "*.jpg" {}

// Tick
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
