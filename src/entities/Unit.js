import { TEAM } from '../core/constants.js';
import { clamp, samplePolyline, uid } from '../core/math.js';

export class Unit {
  constructor({ card, team, laneIndex, progress, offset = 0, level = 1 }) {
    this.id = uid('unit');
    this.type = 'unit';
    this.cardId = card.id;
    this.card = card;
    this.name = card.name;
    this.team = team;
    this.laneIndex = laneIndex;
    this.progress = clamp(progress, 0, 1);
    this.offset = offset;
    this.level = level;
    this.maxHp = Math.round(card.hp * (1 + (level - 1) * 0.12));
    this.hp = this.maxHp;
    this.radius = card.radius;
    this.attackCd = 0.25 + Math.random() * 0.45;
    this.specialCd = card.summonEvery || 0;
    this.hitFlash = 0;
    this.dead = false;
    this.x = 0;
    this.y = 0;
    this.facing = team === TEAM.PLAYER ? 1 : -1;
    this.frenzied = false;
    this.navSegment = 0;
  }

  syncPosition(map) {
    const lane = map.lanes[this.laneIndex];
    const sample = samplePolyline(lane.points, this.progress);
    const breathing = Math.sin((this.progress * 13 + this.offset * 0.08) * Math.PI) * 2.2;
    const sideOffset = this.offset + breathing;
    this.x = sample.point.x + sample.normal.x * sideOffset;
    this.y = sample.point.y + sample.normal.y * sideOffset + (this.card.flying ? -14 : 0);
    this.navSegment = sample.segmentIndex;
  }

  move(dt, map, suddenDeath = false) {
    const lane = map.lanes[this.laneIndex];
    const direction = this.team === TEAM.PLAYER ? 1 : -1;
    const frenzy = this.card.special === 'frenzy' && this.hp / this.maxHp < 0.4;
    this.frenzied = frenzy;
    const speedBonus = frenzy ? 1.45 : 1;
    const sdBonus = suddenDeath ? 1.08 : 1;
    const speed = this.card.speed * speedBonus * sdBonus;
    this.progress = clamp(this.progress + direction * (speed * dt / lane.length), 0, 1);
    this.syncPosition(map);
  }

  damageAmount(suddenDeath = false) {
    let damage = this.card.damage || 0;
    if (this.frenzied) damage *= 1.25;
    if (suddenDeath) damage *= 1.18;
    return Math.round(damage);
  }

  attackInterval() {
    let interval = this.card.attackEvery || 1;
    if (this.frenzied) interval *= 0.72;
    return interval;
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
