export class InputController {
  constructor({ canvas, renderer, game }) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.game = game;
    this.pointerDown = false;
    this.start = null;
    this.bind();
  }

  bind() {
    this.canvas.addEventListener('pointerdown', event => this.onPointerDown(event), { passive: false });
    this.canvas.addEventListener('pointerup', event => this.onPointerUp(event), { passive: false });
    this.canvas.addEventListener('pointercancel', () => this.cancel(), { passive: true });
  }

  onPointerDown(event) {
    event.preventDefault();
    this.pointerDown = true;
    this.start = { x: event.clientX, y: event.clientY };
  }

  onPointerUp(event) {
    event.preventDefault();
    if (!this.pointerDown || !this.start) return;
    const moved = Math.abs(event.clientX - this.start.x) + Math.abs(event.clientY - this.start.y);
    this.pointerDown = false;
    this.start = null;
    if (moved > 20) return;
    this.game.handleWorldTap(this.renderer.screenToWorld(event.clientX, event.clientY));
  }

  cancel() {
    this.pointerDown = false;
    this.start = null;
  }
}
