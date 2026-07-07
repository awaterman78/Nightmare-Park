export const BUILD = 'V13 REPO BUILD';

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
  startingEnergy: 5,
  playerEnergyRegen: 0.82,
  enemyEnergyRegen: 0.76,
  matchSeconds: 180,
  suddenDeathMultiplier: 1.35,
  minDeployYPlayer: FIELD.mid + 6,
  maxDeployYEnemy: FIELD.mid - 6
});
