import { uid } from '../core/math.js';

export class Effect {
  constructor({ x, y, text = '', colour = '#fff', life = 0.7, size = 12, type = 'text' }) {
    this.id = uid('effect');
    this.x = x;
    this.y = y;
    this.text = text;
    this.colour = colour;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.type = type;
  }

  update(dt) {
    this.life -= dt;
    this.y -= dt * 18;
  }

  get alive() {
    return this.life > 0;
  }
}
