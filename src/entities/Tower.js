export class Tower {
  constructor(data) {
    this.id = data.id;
    this.type = 'tower';
    this.team = data.team;
    this.laneIndex = data.laneIndex;
    this.x = data.x;
    this.y = data.y;
    this.kind = data.kind;
    this.maxHp = data.hp;
    this.hp = data.hp;
    this.radius = data.kind === 'core' ? 29 : 24;
    this.range = data.kind === 'core' ? 132 : 112;
    this.damage = data.kind === 'core' ? 18 : 14;
    this.attackEvery = data.kind === 'core' ? 0.72 : 0.86;
    this.attackCd = Math.random() * 0.4;
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
