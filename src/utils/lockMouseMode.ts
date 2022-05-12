export const setLockMouseMode = (canvas: HTMLCanvasElement) => {
  if (canvas) {
    canvas.requestPointerLock =
      canvas.requestPointerLock ||
      (canvas as any).mozRequestPointerLock ||
      (canvas as any).webkitRequestPointerLock;

    canvas.requestPointerLock();

    document.exitPointerLock =
      document.exitPointerLock ||
      (document as any).mozExitPointerLock ||
      (document as any).webkitExitPointerLock;
  }
};

export const isLocked = (canvas: HTMLCanvasElement) => {
  return (
    canvas === document.pointerLockElement ||
    canvas === (document as any).mozPointerLockElement ||
    canvas === (document as any).webkitPointerLockElement
  );
};
