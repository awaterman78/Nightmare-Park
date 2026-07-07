import { uid } from '../core/math.js';

export class Projectile {
  constructor({ team, x, y, target, damage, speed = 260, splash = 0, style = 'bolt', sourceId }) {
    this.id = uid('projectile');
    this.type = 'projectile';
    this.team = team;
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = speed;
    this.splash = splash;
    this.style = style;
    this.sourceId = sourceId;
    this.dead = false;
  }
}
