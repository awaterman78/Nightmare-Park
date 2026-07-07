import { uid } from '../core/math.js';

export class Building {
  constructor({ card, team, x, y, laneIndex, progress }) {
    this.id = uid('building');
    this.type = 'building';
    this.cardId = card.id;
    this.card = card;
    this.name = card.name;
    this.team = team;
    this.x = x;
    this.y = y;
    this.laneIndex = laneIndex;
    this.progress = progress;
    this.maxHp = card.hp;
    this.hp = card.hp;
    this.radius = card.radius;
    this.lifetime = card.lifetime || 40;
    this.age = 0;
    this.attackCd = 0.3;
    this.spawnCd = card.spawnEvery || 0;
    this.hitFlash = 0;
    this.dead = false;
  }

  updateAge(dt) {
    this.age += dt;
    if (this.age >= this.lifetime) this.dead = true;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.16;
    if (this.hp <= 0) this.dead = true;
  }

  get alive() {
    return !this.dead && this.hp > 0;
  }
}
