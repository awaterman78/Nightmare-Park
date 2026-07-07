import { GAME_RULES } from '../core/constants.js';
import { clamp } from '../core/math.js';

export class EconomySystem {
  update(game, dt) {
    const regenBoost = game.state.suddenDeath ? 1.45 : 1;
    game.state.energy = clamp(
      game.state.energy + GAME_RULES.playerEnergyRegen * regenBoost * dt,
      0,
      GAME_RULES.maxEnergy
    );
    game.state.enemyEnergy = clamp(
      game.state.enemyEnergy + GAME_RULES.enemyEnergyRegen * regenBoost * dt,
      0,
      GAME_RULES.maxEnergy
    );
  }
}
