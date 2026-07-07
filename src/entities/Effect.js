import { uid } from '../core/math.js';

export class Effect {
  constructor({ x, y, text = '', colour = '#fff', life = 0.7, size = 12, type = 'text', angle = 0 }) {
    this.id = uid('effect');
    this.x = x;
    this.y = y;
    this.text = text;
    this.colour = colour;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.type = type;
    this.angle = angle;
  }

  update(dt) {
    this.life -= dt;
    if (this.type === 'text') this.y -= dt * 18;
  }

  get alive() {
    return this.life > 0;
  }
}
