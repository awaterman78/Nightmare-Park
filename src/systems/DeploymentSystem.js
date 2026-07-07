import { TEAM } from '../core/constants.js';
import { clamp } from '../core/math.js';
import { CARD_LIBRARY } from '../data/cards.js';
import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';
import { Effect } from '../entities/Effect.js';
import { NavigationSystem } from './NavigationSystem.js';

export class DeploymentSystem {
  constructor() {
    this.navigation = new NavigationSystem();
  }

  deploy(game, cardId, rawX, rawY, team = TEAM.PLAYER, options = {}) {
    const card = CARD_LIBRARY[cardId];
    if (!card || game.state.over) return false;

    const energyKey = team === TEAM.PLAYER ? 'energy' : 'enemyEnergy';
    const free = options.free === true;
    if (!free && game.state[energyKey] < card.cost) {
      if (team === TEAM.PLAYER) game.feed('Not enough cursed energy');
      return false;
    }

    const nav = this.navigation.resolveDeployment(game.map, card, rawX, rawY, team);
    if (!nav.ok) {
      if (team === TEAM.PLAYER) game.feed(nav.reason);
      return false;
    }

    if (!free) game.state[energyKey] -= card.cost;

    if (card.kind === 'building') {
      const building = new Building({ card, team, x: nav.x, y: nav.y, laneIndex: nav.laneIndex, progress: nav.progress });
      game.state.buildings.push(building);
      game.effects.push(new Effect({ x: nav.x, y: nav.y - 18, text: card.shortName, colour: card.colours[0], life: 0.8 }));
      return true;
    }

    const count = card.count || 1;
    const offsets = this.offsets(count, card.radius || 10);
    for (let i = 0; i < count; i++) {
      const unit = new Unit({
        card,
        team,
        laneIndex: nav.laneIndex,
        progress: clamp(nav.progress + offsets[i].progress, 0, 1),
        offset: offsets[i].x
      });
      unit.syncPosition(game.map);
      game.state.units.push(unit);
    }
    game.effects.push(new Effect({ x: nav.x, y: nav.y - 16, text: nav.routeName, colour: card.colours[0], life: 0.75, size: 9 }));
    return true;
  }

  summon(game, cardId, team, laneIndex, progress, xShift = 0) {
    const card = CARD_LIBRARY[cardId];
    if (!card) return;
    const unit = new Unit({ card, team, laneIndex, progress, offset: xShift, level: 1 });
    unit.syncPosition(game.map);
    game.state.units.push(unit);
  }

  offsets(count, radius = 10) {
    const spread = Math.max(8, radius * 1.15);
    if (count === 1) return [{ x: 0, progress: 0 }];
    if (count === 2) return [{ x: -spread, progress: -0.004 }, { x: spread, progress: 0.004 }];
    if (count === 3) return [{ x: -spread, progress: -0.004 }, { x: 0, progress: 0 }, { x: spread, progress: 0.004 }];
    return [
      { x: -spread, progress: -0.006 },
      { x: spread, progress: -0.002 },
      { x: -spread * 0.45, progress: 0.004 },
      { x: spread * 0.55, progress: 0.008 }
    ];
  }
}
