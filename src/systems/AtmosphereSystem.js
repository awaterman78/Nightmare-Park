import { TEAM } from '../core/constants.js';

export class AtmosphereSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      time: 0,
      wind: 0,
      danger: 0,
      lightning: 0,
      lightningCooldown: 8 + Math.random() * 8,
      flashCount: 0,
      fogSurge: 0,
      moonPulse: 0,
      lastMood: 'waking'
    };
  }

  update(game, dt) {
    const s = this.state;
    s.time += dt;
    s.wind = Math.sin(s.time * 0.22) * 0.7 + Math.sin(s.time * 0.071 + 2.4) * 0.3;
    s.fogSurge = 0.5 + Math.sin(s.time * 0.35) * 0.25 + Math.sin(s.time * 0.11 + 1.8) * 0.25;
    s.moonPulse = 0.5 + Math.sin(s.time * 0.18 + 1.1) * 0.5;

    const playerCore = game.getCore?.(TEAM.PLAYER);
    const enemyCore = game.getCore?.(TEAM.ENEMY);
    const playerDamage = playerCore?.maxHp ? 1 - Math.max(0, playerCore.hp) / playerCore.maxHp : 0;
    const enemyDamage = enemyCore?.maxHp ? 1 - Math.max(0, enemyCore.hp) / enemyCore.maxHp : 0;
    const sudden = game.state?.suddenDeath ? 0.35 : 0;
    const combatLoad = Math.min(0.25, ((game.state?.units?.length || 0) + (game.state?.projectiles?.length || 0)) / 90);
    const targetDanger = Math.min(1, 0.12 + sudden + Math.max(playerDamage, enemyDamage) * 0.45 + combatLoad);
    s.danger += (targetDanger - s.danger) * Math.min(1, dt * 1.8);

    s.lightningCooldown -= dt * (game.state?.suddenDeath ? 1.75 : 1);
    if (s.lightningCooldown <= 0) {
      s.lightning = game.state?.suddenDeath ? 0.72 : 0.48;
      s.lightningCooldown = (game.state?.suddenDeath ? 6 : 11) + Math.random() * 12;
      s.flashCount += 1;
      if (s.flashCount <= 2 || game.state?.suddenDeath) {
        game.feed?.(game.state?.suddenDeath ? 'The park is flashing with sudden death energy' : 'Moonflash rolls over the haunted midway');
      }
    }
    s.lightning = Math.max(0, s.lightning - dt * 2.6);

    const mood = game.state?.suddenDeath ? 'sudden-death' : s.danger > 0.56 ? 'angry' : s.danger > 0.32 ? 'restless' : 'breathing';
    if (mood !== s.lastMood) {
      s.lastMood = mood;
      if (mood === 'angry') game.feed?.('The arena reacts: torches flare and fog thickens');
    }
  }
}
