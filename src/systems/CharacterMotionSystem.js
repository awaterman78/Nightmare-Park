import { CHARACTER_LIBRARY, characterProfile } from '../data/characters.js';
import { Effect } from '../entities/Effect.js';
import { clamp } from '../core/math.js';

export class CharacterMotionSystem {
  update(game, dt) {
    if (!game?.state?.units) return;
    for (const unit of game.state.units) {
      if (!unit.alive) continue;
      this.updateUnit(game, unit, dt);
    }
  }

  updateUnit(game, unit, dt) {
    const profile = characterProfile(unit.cardId);
    const motion = this.ensureMotion(unit, profile);
    const prevX = motion.prevX ?? unit.x;
    const prevY = motion.prevY ?? unit.y;
    const dx = unit.x - prevX;
    const dy = unit.y - prevY;
    const moved = Math.hypot(dx, dy);
    const speedPx = moved / Math.max(dt, 0.001);
    const moving = moved > 0.08 && unit.attackAnim <= 0.02;
    const attacking = unit.attackAnim > 0.02;
    const spawning = unit.spawnAnim > 0.02;
    const special = unit.abilityPulse > 0.02 || unit.frenzied;

    motion.prevX = unit.x;
    motion.prevY = unit.y;
    motion.state = spawning ? 'spawn' : attacking ? 'attack' : special ? 'special' : moving ? 'walk' : 'idle';
    motion.speedNorm = clamp(speedPx / 58, 0, 1.8);
    motion.stride += dt * (profile.motion.cadence || 6) * (moving ? 1 + motion.speedNorm * 0.35 : 0.25);
    motion.breath += dt * (profile.motion.locomotion === 'hover' ? 2.4 : 1.45);
    motion.lean = this.mix(motion.lean || 0, clamp(dx * 0.035, -profile.motion.lean, profile.motion.lean), 0.18);
    motion.attackWeight = this.mix(motion.attackWeight || 0, attacking ? 1 : 0, attacking ? 0.38 : 0.22);
    motion.specialWeight = this.mix(motion.specialWeight || 0, special ? 1 : 0, special ? 0.28 : 0.12);
    motion.spawnWeight = clamp(unit.spawnAnim / 0.38, 0, 1);

    if (Math.abs(dx) > 0.05 && !attacking) unit.facing = dx > 0 ? 1 : -1;

    this.updateTrails(unit, profile, motion, dt);
    this.emitMotionEffects(game, unit, profile, motion, moving, moved, dt);
  }

  ensureMotion(unit, profile) {
    if (!unit.motion) unit.motion = {};
    const motion = unit.motion;
    motion.profileId = profile.id;
    motion.state ||= 'spawn';
    motion.stride ||= Math.random() * Math.PI * 2;
    motion.breath ||= Math.random() * Math.PI * 2;
    motion.lean ||= 0;
    motion.speedNorm ||= 0;
    motion.footstepTimer ||= 0;
    motion.trail ||= [];
    return motion;
  }

  updateTrails(unit, profile, motion, dt) {
    const shouldTrail = profile.motion.trail || unit.frenzied || unit.card.flying;
    if (!shouldTrail) {
      motion.trail.length = 0;
      return;
    }
    motion.trailTimer = (motion.trailTimer || 0) - dt;
    if (motion.trailTimer <= 0 && (motion.speedNorm > 0.08 || unit.card.flying || unit.frenzied)) {
      motion.trailTimer = unit.card.flying ? 0.055 : 0.075;
      motion.trail.unshift({
        x: unit.x,
        y: unit.y,
        facing: unit.facing || 1,
        scale: 1,
        life: unit.card.flying ? 0.34 : 0.24,
        maxLife: unit.card.flying ? 0.34 : 0.24
      });
    }
    for (const ghost of motion.trail) ghost.life -= dt;
    motion.trail = motion.trail.filter(ghost => ghost.life > 0).slice(0, unit.card.flying ? 7 : 5);
  }

  emitMotionEffects(game, unit, profile, motion, moving, moved, dt) {
    if (unit.card.flying) {
      if (moving && Math.random() < dt * 5.5) {
        game.effects.push(new Effect({
          x: unit.x + (Math.random() - 0.5) * 16,
          y: unit.y + unit.radius + 10,
          colour: 'rgba(136,239,255,.45)',
          life: 0.34,
          size: 10,
          type: 'airwake',
          angle: Math.random() * Math.PI
        }));
      }
      return;
    }

    motion.footstepTimer -= dt;
    const cadence = profile.motion.footstepEvery || 0.3;
    if (moving && motion.footstepTimer <= 0 && moved > 0.15) {
      motion.footstepTimer = cadence / Math.max(0.85, motion.speedNorm + 0.65);
      const colour = profile.signature.vfx || unit.card.colours?.[0] || '#fff';
      game.effects.push(new Effect({
        x: unit.x - (unit.facing || 1) * 4 + (Math.random() - 0.5) * 5,
        y: unit.y + unit.radius * 0.78,
        colour,
        life: profile.motion.locomotion === 'stomp' ? 0.42 : 0.28,
        size: profile.motion.locomotion === 'stomp' ? 13 : 8,
        type: profile.motion.locomotion === 'stomp' ? 'stompDust' : 'dust'
      }));
    }
  }

  mix(a, b, amount) {
    return a + (b - a) * clamp(amount, 0, 1);
  }
}

export { CHARACTER_LIBRARY };
