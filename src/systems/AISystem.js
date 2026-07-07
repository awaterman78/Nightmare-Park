import { TEAM } from '../core/constants.js';
import { CARD_LIBRARY, ENEMY_DECK } from '../data/cards.js';
import { pointOnPolyline } from '../core/math.js';

export class AISystem {
  update(game, dt) {
    if (game.state.over) return;
    game.state.aiTimer -= dt;
    if (game.state.aiTimer > 0) return;

    const pressureLane = this.pickPressureLane(game);
    const affordable = ENEMY_DECK
      .map(id => CARD_LIBRARY[id])
      .filter(card => card.cost <= game.state.enemyEnergy);

    if (affordable.length === 0) {
      game.state.aiTimer = 0.8;
      return;
    }

    const card = this.chooseCard(affordable, game, pressureLane);
    const lane = game.map.lanes[pressureLane];
    const t = card.kind === 'building' ? 0.35 + Math.random() * 0.12 : 0.12 + Math.random() * 0.28;
    const p = pointOnPolyline(lane.points, t);
    game.deploy(card.id, p.x + (Math.random() - 0.5) * 32, p.y + (Math.random() - 0.5) * 18, TEAM.ENEMY);
    game.state.aiTimer = 1.2 + Math.random() * (game.state.suddenDeath ? 0.9 : 1.8);
  }

  pickPressureLane(game) {
    const pressure = [0, 0, 0];
    for (const unit of game.state.units) {
      if (unit.team === TEAM.PLAYER && unit.alive) pressure[unit.laneIndex] += unit.card.cost || 1;
    }
    const max = Math.max(...pressure);
    if (max > 0 && Math.random() < 0.7) return pressure.indexOf(max);
    return Math.floor(Math.random() * 3);
  }

  chooseCard(cards, game, laneIndex) {
    const playerUnitsInLane = game.state.units.filter(u => u.team === TEAM.PLAYER && u.laneIndex === laneIndex && u.alive).length;
    const buildingsNeeded = playerUnitsInLane >= 3;
    const sorted = [...cards].sort((a, b) => {
      const aScore = this.score(a, buildingsNeeded, playerUnitsInLane);
      const bScore = this.score(b, buildingsNeeded, playerUnitsInLane);
      return bScore - aScore;
    });
    const top = sorted.slice(0, Math.min(sorted.length, 3));
    return top[Math.floor(Math.random() * top.length)];
  }

  score(card, buildingsNeeded, enemyCount) {
    let score = Math.random() * 1.2;
    if (buildingsNeeded && card.kind === 'building') score += 2.4;
    if (enemyCount >= 2 && card.id === 'bruteClown') score += 1.5;
    if (enemyCount >= 3 && card.id === 'midnightWitch') score += 1.3;
    if (card.cost <= 3) score += 0.6;
    return score;
  }
}
