export const BUILD = 'V18 CHARACTER ASSET PIPELINE + CINEMATIC MOTION';

export const VIEW = Object.freeze({
  width: 390,
  height: 844
});

export const FIELD = Object.freeze({
  x: 18,
  y: 76,
  width: 354,
  height: 584,
  top: 76,
  bottom: 660,
  mid: 368
});

export const TEAM = Object.freeze({
  PLAYER: 'player',
  ENEMY: 'enemy'
});

export const GAME_RULES = Object.freeze({
  maxEnergy: 10,
  startingEnergy: 6,
  playerEnergyRegen: 0.9,
  enemyEnergyRegen: 0.94,
  matchSeconds: 180,
  suddenDeathMultiplier: 1.35,
  handSize: 4,
  // Lane progress is 0 at the player base and 1 at the enemy base.
  minDeployProgressPlayer: 0.04,
  maxDeployProgressPlayer: 0.49,
  minDeployProgressEnemy: 0.51,
  maxDeployProgressEnemy: 0.96,
  minDeployYPlayer: FIELD.mid + 6,
  maxDeployYEnemy: FIELD.mid - 6
});
