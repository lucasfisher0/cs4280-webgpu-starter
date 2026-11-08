import {Vec3} from "@/core/math/Vec3.ts";
import {Camera} from "@/core/components/Camera.ts";

type PointerRegistration = {
  id: string,
  abort: AbortController,
  eventCallback: (e: PointerEvent, elem: HTMLElement, point: Vec3) => void,
};

type KeyCallback = (e: KeyboardEvent) => void;
type KeyRegistration = {
  onDown: KeyCallback[],
  onUp: KeyCallback[],
}

/**
 * Singleton pattern manager for handling keyboard and mouse events.
 */
export abstract class InputManager {
  private static pointerRegistrations: Record<string, PointerRegistration> = {};
  private static elementCache: Record<string, HTMLElement> = {};

  private static keyStatus = new Map<string, boolean>();
  private static keyRegistration = new Map<string, KeyRegistration>();
  private static shiftKey = false;

  private constructor() {
  }

  public static handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    InputManager.keyStatus.set(key, true);
    InputManager.keyRegistration.get(key)?.onDown.forEach(fn => fn(e));
    InputManager.shiftKey = e.shiftKey;
  }

  public static handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    InputManager.keyStatus.set(key, true);
    InputManager.keyRegistration.get(key)?.onUp.forEach(fn => fn(e));
    InputManager.shiftKey = e.shiftKey;
  }

  public static isKeyDown(key: string, shift: boolean = false): boolean {
    key = key.toLowerCase();
    return (
      InputManager.keyStatus.get(key) &&
      (InputManager.shiftKey || !shift)) ?? false;
  }

  public static get isShiftDown(): boolean {
    return InputManager.shiftKey;
  }

  public static registerKey(key: string, onDown: KeyCallback, onUp: KeyCallback) {
    if (!InputManager.keyRegistration.has(key))
      InputManager.keyRegistration.set(key, {onDown: [], onUp: []});

    const reg = InputManager.keyRegistration.get(key)!;
    reg.onDown.push(onDown);
    reg.onUp.push(onUp);
  }

  public static registerPointer(
    id: string,
    eventCallback: (event: PointerEvent, elem: HTMLElement, point: Vec3, dir: Vec3) => void) {
    const elem = InputManager.elementCache[id] ?? document.getElementById(id);
    if (!elem) {
      console.warn(`InputManager.registerPointer: Failed to find element with id '${id}'.`)
      return;
    }

    const abortController = new AbortController();
    const reg: PointerRegistration = {
      id: id,
      abort: abortController,
      eventCallback: eventCallback
    };
    InputManager.pointerRegistrations[id] = reg;

    const eventList = ["pointerdown", "pointerup", "pointercancel", "pointerleave", "pointermove"];
    for (const event of eventList) {
      elem.addEventListener(event, (e: Event) => {
        if (e instanceof PointerEvent) {
          const reg = InputManager.pointerRegistrations[elem.id];
          if (!reg)
            return;

          let pos = Vec3.Zero();
          if (elem instanceof HTMLCanvasElement) {
            const rect = (elem as HTMLCanvasElement).getBoundingClientRect();
            const aspect = rect.width / rect.height;
            pos.x += (((e.clientX - rect.left) / rect.width) * 2 - 1) * aspect;
            pos.y += 1 - ((e.clientY - rect.top) / rect.height) * 2;
          }

          /* const cameraPos = Camera.activeCamera.getCameraPosition();
          pos.x += cameraPos.x;
          pos.y += cameraPos.y;
          pos.z += cameraPos.z;

          const dir = Camera.activeCamera.getForwardVector();

          if (e.type === "pointerdown")
            console.warn("World Position: " + pos.toArray()); */

          reg.eventCallback(e as PointerEvent, elem, pos);
        }
        let event = e as PointerEvent;
      }, {signal: abortController.signal});
    }
  }

  public static unregisterPointer(id: string) {
    const rec = InputManager.pointerRegistrations[id];
    if (!rec)
      return;

    rec!.abort.abort();
    delete InputManager.pointerRegistrations[id];
  }
}
