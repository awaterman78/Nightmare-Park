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
      game.state.aiTimer = 0.55;
      return;
    }

    const card = this.chooseCard(affordable, game, pressureLane);
    const lane = game.map.lanes[pressureLane];
    // Lane progress is 0 = player base, 1 = enemy base. Enemy must deploy high on the map.
    const t = card.kind === 'building'
      ? 0.58 + Math.random() * 0.16
      : 0.62 + Math.random() * 0.28;
    const p = pointOnPolyline(lane.points, t);
    const deployed = game.deploy(card.id, p.x + (Math.random() - 0.5) * 22, p.y + (Math.random() - 0.5) * 14, TEAM.ENEMY);
    if (deployed) {
      game.state.enemyPlays += 1;
      if (game.state.enemyPlays <= 4 || Math.random() < 0.35) game.feed(`Enemy played ${card.shortName}`);
    }
    game.state.aiTimer = 0.85 + Math.random() * (game.state.suddenDeath ? 0.85 : 1.45);
  }

  pickPressureLane(game) {
    const pressure = [0, 0, 0];
    for (const unit of game.state.units) {
      if (unit.team === TEAM.PLAYER && unit.alive) pressure[unit.laneIndex] += unit.card.cost || 1;
    }
    const max = Math.max(...pressure);
    if (max > 0 && Math.random() < 0.72) return pressure.indexOf(max);
    const damagedSide = this.mostDamagedEnemySide(game);
    if (damagedSide !== null && Math.random() < 0.38) return damagedSide;
    return Math.floor(Math.random() * 3);
  }

  mostDamagedEnemySide(game) {
    const sides = game.state.towers.filter(t => t.team === TEAM.ENEMY && t.kind === 'side' && t.alive);
    if (!sides.length) return null;
    sides.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    return sides[0].laneIndex;
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
