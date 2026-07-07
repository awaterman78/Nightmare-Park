import { getDefense } from '../data/defenses.js';

export class Tower {
  constructor(data) {
    const defense = getDefense(data.defenseId);
    this.id = data.id;
    this.type = 'tower';
    this.team = data.team;
    this.laneIndex = data.laneIndex;
    this.x = data.x;
    this.y = data.y;
    this.kind = data.kind;
    this.slot = data.slot || (data.kind === 'core' ? 'core' : 'side');
    this.defenseId = defense.id;
    this.defense = defense;
    this.displayName = defense.name;
    this.customisable = defense.customisable === true;
    this.maxHp = data.hp || defense.hp;
    this.hp = this.maxHp;
    this.radius = defense.radius || (data.kind === 'core' ? 34 : 25);
    this.range = defense.range || (data.kind === 'core' ? 138 : 118);
    this.damage = defense.damage || (data.kind === 'core' ? 19 : 15);
    this.attackEvery = defense.attackEvery || (data.kind === 'core' ? 0.68 : 0.82);
    this.projectile = defense.projectile || (data.kind === 'core' ? 'gateBolt' : 'soulBolt');
    this.attackCd = Math.random() * 0.4;
    this.attackPulse = 0;
    this.hitFlash = 0;
    this.dead = false;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.18;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  get alive() {
    return !this.dead && this.hp > 0;
  }
}
