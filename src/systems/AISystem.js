import { TEAM } from '../core/constants.js';
import { CARD_LIBRARY } from '../data/cards.js';
import { pointOnPolyline } from '../core/math.js';
import { Effect } from '../entities/Effect.js';

export class AISystem {
  update(game, dt) {
    if (game.state.over) return;

    game.state.aiTimer -= dt;
    if (game.state.aiTimer > 0) return;

    const decision = this.decide(game);
    game.state.enemyIntent = decision.intent;
    game.state.enemyLane = decision.laneIndex;
    game.state.enemyMood = decision.mood;

    if (!decision.card) {
      game.state.aiTimer = 0.32;
      return;
    }

    const deployed = this.playDecision(game, decision);
    if (deployed) {
      const card = decision.card;
      const routeName = game.map.lanes[decision.laneIndex]?.name || 'route';
      game.feed(`Enemy played ${card.shortName} — ${decision.intent}`);
      game.effects.push(new Effect({
        x: decision.x,
        y: decision.y - 26,
        text: `Enemy ${card.shortName}`,
        colour: '#ff5b6e',
        life: 0.95,
        size: 10
      }));
      game.state.enemyLastPlay = `${card.shortName} on ${routeName}`;
      game.state.aiTimer = this.nextDelay(game, true);
    } else {
      game.state.aiTimer = this.nextDelay(game, false);
    }
  }

  decide(game) {
    const lanes = this.analyseLanes(game);
    const threat = lanes.reduce((best, lane) => lane.threat > best.threat ? lane : best, lanes[0]);
    const opportunity = lanes.reduce((best, lane) => lane.opportunity > best.opportunity ? lane : best, lanes[1]);
    const affordable = game.state.enemyHand
      .map(id => CARD_LIBRARY[id])
      .filter(Boolean)
      .filter(card => card.cost <= game.state.enemyEnergy);

    if (!affordable.length) {
      return { card: null, laneIndex: threat.laneIndex, intent: 'Saving energy', mood: 'waiting' };
    }

    const hasSeriousThreat = threat.threat >= 2.8 || threat.unitsNearEnemy >= 2;
    const lane = hasSeriousThreat ? threat : this.pickAttackLane(game, opportunity, lanes);
    const intent = hasSeriousThreat ? 'Defending pressure' : this.pickAttackIntent(game, lane);
    const mood = hasSeriousThreat ? 'defending' : (game.state.suddenDeath ? 'all-in' : 'pressuring');

    const card = this.chooseCard(affordable, game, lane, { hasSeriousThreat, intent });
    const progress = this.deployProgressFor(card, hasSeriousThreat, game);
    const point = this.lanePoint(game, lane.laneIndex, progress, card.kind === 'building');

    return { card, laneIndex: lane.laneIndex, intent, mood, progress, x: point.x, y: point.y };
  }

  analyseLanes(game) {
    return game.map.lanes.map(lane => {
      const playerUnits = game.state.units.filter(u => u.team === TEAM.PLAYER && u.laneIndex === lane.index && u.alive);
      const enemyUnits = game.state.units.filter(u => u.team === TEAM.ENEMY && u.laneIndex === lane.index && u.alive);
      const unitsNearEnemy = playerUnits.filter(u => u.progress > 0.52).length;
      const threat = playerUnits.reduce((sum, unit) => {
        const weight = unit.card.cost || 1;
        const proximity = Math.max(0, unit.progress - 0.34) * 4.2;
        return sum + weight * (0.3 + proximity);
      }, 0);
      const enemyTower = game.state.towers.find(t => t.team === TEAM.ENEMY && t.kind === 'side' && t.laneIndex === lane.index);
      const playerTower = game.state.towers.find(t => t.team === TEAM.PLAYER && t.kind === 'side' && t.laneIndex === lane.index);
      const enemyTowerDamaged = enemyTower ? 1 - enemyTower.hp / enemyTower.maxHp : 0.8;
      const playerTowerDamaged = playerTower ? 1 - playerTower.hp / playerTower.maxHp : 0.25;
      const opportunity = playerTowerDamaged * 3.4 + enemyUnits.length * 0.6 - enemyTowerDamaged * 1.3;
      return { laneIndex: lane.index, threat, opportunity, unitsNearEnemy, playerUnits, enemyUnits, enemyTower, playerTower };
    });
  }

  pickAttackLane(game, opportunity, lanes) {
    if (Math.random() < 0.58) return opportunity;
    if (game.state.enemyLane !== undefined && Math.random() < 0.35) return lanes[game.state.enemyLane] || opportunity;
    return lanes[Math.floor(Math.random() * lanes.length)];
  }

  pickAttackIntent(game, lane) {
    if (game.state.suddenDeath) return 'Sudden death push';
    if (lane.playerTower && lane.playerTower.hp / lane.playerTower.maxHp < 0.55) return 'Finish weak tower';
    if (lane.enemyUnits.length >= 2) return 'Support existing push';
    return Math.random() < 0.5 ? 'Build lane pressure' : 'Split pressure';
  }

  chooseCard(cards, game, lane, context) {
    const sorted = [...cards].sort((a, b) => {
      const aScore = this.score(a, game, lane, context);
      const bScore = this.score(b, game, lane, context);
      return bScore - aScore;
    });
    const choicePool = sorted.slice(0, Math.min(sorted.length, context.hasSeriousThreat ? 2 : 3));
    return choicePool[Math.floor(Math.random() * choicePool.length)];
  }

  score(card, game, lane, { hasSeriousThreat, intent }) {
    let score = Math.random() * 0.75;

    if (hasSeriousThreat) {
      if (card.id === 'cursedWatchtower') score += 3.2;
      if (card.id === 'skeletonSwarm') score += lane.playerUnits.length >= 2 ? 2.6 : 1.1;
      if (card.id === 'bruteClown') score += 1.9;
      if (card.id === 'midnightWitch') score += 1.6;
      if (card.id === 'gargoyle') score += 1.1;
      if (card.id === 'pumpkinCatapult') score -= 1.4;
    } else {
      if (intent === 'Support existing push') {
        if (card.id === 'midnightWitch') score += 2.6;
        if (card.id === 'gargoyle') score += 2.1;
        if (card.id === 'pumpkinCatapult') score += 1.8;
      }
      if (card.id === 'bruteClown') score += 1.8;
      if (card.id === 'werewolfRunner' || card.id === 'graveGoblin') score += 1.4;
      if (card.id === 'pumpkinCatapult') score += lane.playerTower && lane.playerTower.alive ? 2.1 : 0.6;
      if (card.kind === 'building') score += game.state.enemyEnergy > 8 ? 0.9 : -0.9;
    }

    if (game.state.suddenDeath && card.cost >= 4) score += 0.8;
    if (game.state.enemyEnergy - card.cost < 0.8 && card.cost > 4) score -= 0.7;
    return score;
  }

  deployProgressFor(card, defending, game) {
    if (card.kind === 'building') return defending ? 0.57 + Math.random() * 0.08 : 0.62 + Math.random() * 0.08;
    if (defending) return 0.58 + Math.random() * 0.11;
    if (card.id === 'pumpkinCatapult') return 0.66 + Math.random() * 0.07;
    if (card.id === 'bruteClown') return 0.65 + Math.random() * 0.1;
    return 0.62 + Math.random() * 0.18;
  }

  lanePoint(game, laneIndex, progress, isBuilding) {
    const lane = game.map.lanes[laneIndex];
    const p = pointOnPolyline(lane.points, progress);
    const jitter = isBuilding ? 28 : 14;
    return {
      x: p.x + (Math.random() - 0.5) * jitter,
      y: p.y + (Math.random() - 0.5) * Math.max(10, jitter * 0.55)
    };
  }

  playDecision(game, decision) {
    const attempts = [
      { x: decision.x, y: decision.y, progress: decision.progress },
      { ...this.lanePoint(game, decision.laneIndex, decision.progress, false), progress: decision.progress },
      { ...this.lanePoint(game, decision.laneIndex, Math.max(0.56, Math.min(0.72, decision.progress - 0.04)), false), progress: decision.progress - 0.04 },
      { ...this.lanePoint(game, decision.laneIndex, 0.62, false), progress: 0.62 }
    ];

    for (const attempt of attempts) {
      if (game.deploy(decision.card.id, attempt.x, attempt.y, TEAM.ENEMY)) {
        decision.x = attempt.x;
        decision.y = attempt.y;
        return true;
      }
    }
    return false;
  }

  nextDelay(game, success) {
    if (!success) return 0.32 + Math.random() * 0.35;
    const base = game.state.suddenDeath ? 0.82 : 1.18;
    const energyPressure = game.state.enemyEnergy > 7 ? -0.25 : 0.35;
    return Math.max(0.55, base + energyPressure + Math.random() * 0.8);
  }
}
