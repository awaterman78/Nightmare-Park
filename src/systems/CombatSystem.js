import { TEAM } from '../core/constants.js';
import { distanceXY } from '../core/math.js';
import { Projectile } from '../entities/Projectile.js';
import { Effect } from '../entities/Effect.js';

export class CombatSystem {
  update(game, dt) {
    this.tickTimers(game, dt);
    this.updateBuildings(game, dt);
    this.updateUnits(game, dt);
    this.updateTowers(game, dt);
    this.updateProjectiles(game, dt);
    this.cleanDead(game);
    this.checkWinLose(game);
  }

  tickTimers(game, dt) {
    for (const unit of game.state.units) {
      unit.attackCd -= dt;
      unit.hitFlash = Math.max(0, unit.hitFlash - dt);
      if (unit.card.special === 'summoner') unit.specialCd -= dt;
    }
    for (const building of game.state.buildings) {
      building.attackCd -= dt;
      building.spawnCd -= dt;
      building.hitFlash = Math.max(0, building.hitFlash - dt);
    }
    for (const tower of game.state.towers) {
      tower.attackCd -= dt;
      tower.hitFlash = Math.max(0, tower.hitFlash - dt);
    }
    for (const effect of game.effects) effect.update(dt);
    game.effects = game.effects.filter(effect => effect.alive);
  }

  updateBuildings(game, dt) {
    for (const building of game.state.buildings) {
      if (!building.alive) continue;
      building.updateAge(dt);

      if (building.card.spawnId && building.spawnCd <= 0) {
        building.spawnCd = building.card.spawnEvery || 4;
        const shift = (Math.random() - 0.5) * 18;
        game.deployment.summon(game, building.card.spawnId, building.team, building.laneIndex, building.progress, shift);
        game.effects.push(new Effect({ x: building.x, y: building.y - 18, text: '+Bone', colour: '#e8e1c8', life: 0.55, size: 11 }));
      }

      if (building.card.damage && building.attackCd <= 0) {
        const target = this.findTarget(game, building, building.card.range, { unitsOnly: true, canHitAir: true });
        if (target) {
          building.attackCd = building.card.attackEvery || 1;
          this.fireProjectile(game, building, target, building.card.damage, building.card.projectile || 'bolt', 0, 285);
        }
      }
    }
  }

  updateUnits(game, dt) {
    for (const unit of game.state.units) {
      if (!unit.alive) continue;
      unit.syncPosition(game.map);

      if (unit.card.special === 'summoner' && unit.specialCd <= 0) {
        unit.specialCd = unit.card.summonEvery || 5;
        const spawnProgress = unit.team === TEAM.PLAYER ? unit.progress - 0.01 : unit.progress + 0.01;
        game.deployment.summon(game, unit.card.summonId, unit.team, unit.laneIndex, spawnProgress, (Math.random() - 0.5) * 18);
        game.effects.push(new Effect({ x: unit.x, y: unit.y - 20, text: 'summon', colour: '#d58cff', life: 0.6, size: 10 }));
      }

      const target = this.findTarget(game, unit, unit.card.range, {
        mode: unit.card.targetMode,
        canHitAir: unit.card.canHitAir
      });

      if (target) {
        if (unit.attackCd <= 0) {
          unit.attackCd = unit.attackInterval();
          this.attack(game, unit, target);
        }
      } else {
        unit.move(dt, game.map, game.state.suddenDeath);
      }
    }
  }

  updateTowers(game, dt) {
    for (const tower of game.state.towers) {
      if (!tower.alive) continue;
      if (tower.attackCd > 0) continue;
      const target = this.findTarget(game, tower, tower.range, { unitsOnly: true, canHitAir: true });
      if (!target) continue;
      tower.attackCd = tower.attackEvery;
      const damage = Math.round(tower.damage * (game.state.suddenDeath ? 1.25 : 1));
      this.fireProjectile(game, tower, target, damage, tower.kind === 'core' ? 'corebolt' : 'bolt', 0, 310);
    }
  }

  updateProjectiles(game, dt) {
    for (const projectile of game.state.projectiles) {
      if (projectile.dead) continue;
      const target = projectile.target;
      if (!target || !target.alive) {
        projectile.dead = true;
        continue;
      }
      const dx = target.x - projectile.x;
      const dy = target.y - projectile.y;
      const d = Math.hypot(dx, dy);
      if (d < 7 + (target.radius || 0) * 0.25) {
        this.applyDamage(game, projectile, target);
        projectile.dead = true;
      } else {
        const step = Math.min(d, projectile.speed * dt);
        projectile.x += (dx / d) * step;
        projectile.y += (dy / d) * step;
      }
    }
    game.state.projectiles = game.state.projectiles.filter(projectile => !projectile.dead);
  }

  attack(game, attacker, target) {
    const damage = attacker.damageAmount ? attacker.damageAmount(game.state.suddenDeath) : attacker.damage;
    if (attacker.card.attackType === 'melee') {
      target.takeDamage(damage);
      attacker.facing = target.x >= attacker.x ? 1 : -1;
      game.effects.push(new Effect({ x: target.x, y: target.y - 10, text: `-${damage}`, colour: attacker.card.colours[0], life: 0.45, size: 10 }));
      if (attacker.card.special === 'bleed' && Math.random() < 0.22) {
        target.takeDamage(4);
        game.effects.push(new Effect({ x: target.x + 4, y: target.y - 18, text: 'bleed', colour: '#7dff66', life: 0.48, size: 9 }));
      }
      return;
    }
    this.fireProjectile(game, attacker, target, damage, attacker.card.projectile || 'bolt', attacker.card.splash || 0, this.projectileSpeed(attacker.card.projectile));
  }

  fireProjectile(game, source, target, damage, style, splash = 0, speed = 260) {
    game.state.projectiles.push(new Projectile({
      team: source.team,
      x: source.x,
      y: source.y - (source.type === 'tower' ? 16 : 8),
      target,
      damage,
      speed,
      splash,
      style,
      sourceId: source.id
    }));
  }

  applyDamage(game, projectile, target) {
    target.takeDamage(projectile.damage);
    game.effects.push(new Effect({ x: target.x, y: target.y - 12, text: `-${projectile.damage}`, colour: '#ffd86f', life: 0.45, size: 10 }));

    if (projectile.splash > 0) {
      const splashTargets = this.liveTargets(game, projectile.team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER)
        .filter(t => t.id !== target.id && distanceXY(t.x, t.y, target.x, target.y) <= projectile.splash);
      for (const t of splashTargets) {
        const splashDamage = Math.max(4, Math.round(projectile.damage * 0.45));
        t.takeDamage(splashDamage);
        game.effects.push(new Effect({ x: t.x, y: t.y - 8, text: `-${splashDamage}`, colour: '#ff9b35', life: 0.38, size: 9 }));
      }
    }
  }

  findTarget(game, attacker, range, options = {}) {
    const enemyTeam = attacker.team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER;
    const targets = this.liveTargets(game, enemyTeam)
      .filter(target => this.canTarget(attacker, target, options))
      .map(target => ({ target, d: distanceXY(attacker.x, attacker.y, target.x, target.y) - (target.radius || 0) - (attacker.radius || 0) }))
      .filter(item => item.d <= range)
      .sort((a, b) => this.targetSort(attacker, a, b));

    return targets[0]?.target || null;
  }

  canTarget(attacker, target, options) {
    if (!target.alive) return false;
    if (options.unitsOnly && target.type !== 'unit') return false;
    if (target.type === 'unit' && target.card?.flying && !options.canHitAir) return false;
    if (options.mode === 'buildings' && target.type !== 'building' && target.type !== 'tower') return false;
    if (options.mode === 'ground' && target.type === 'unit' && target.card?.flying) return false;
    return true;
  }

  liveTargets(game, team) {
    return [
      ...game.state.units.filter(unit => unit.team === team && unit.alive),
      ...game.state.buildings.filter(building => building.team === team && building.alive),
      ...game.state.towers.filter(tower => tower.team === team && tower.alive)
    ];
  }

  targetSort(attacker, a, b) {
    if (attacker.card?.targetMode === 'buildings') {
      const aIsCore = a.target.kind === 'core' ? 1 : 0;
      const bIsCore = b.target.kind === 'core' ? 1 : 0;
      if (aIsCore !== bIsCore) return bIsCore - aIsCore;
    }
    return a.d - b.d;
  }

  projectileSpeed(style) {
    if (style === 'pumpkin') return 190;
    if (style === 'stone') return 235;
    if (style === 'hex') return 250;
    return 290;
  }

  cleanDead(game) {
    game.state.units = game.state.units.filter(unit => unit.alive && unit.progress > 0 && unit.progress < 1);
    game.state.buildings = game.state.buildings.filter(building => building.alive);
  }

  checkWinLose(game) {
    const playerCore = game.getCore(TEAM.PLAYER);
    const enemyCore = game.getCore(TEAM.ENEMY);
    if (enemyCore && !enemyCore.alive) game.endMatch('victory');
    if (playerCore && !playerCore.alive) game.endMatch('defeat');
  }
}
