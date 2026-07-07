import { GAME_RULES, TEAM } from './constants.js';
import { MAP } from '../data/map.js';
import { CARD_LIBRARY } from '../data/cards.js';
import { Tower } from '../entities/Tower.js';
import { DeploymentSystem } from '../systems/DeploymentSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { AISystem } from '../systems/AISystem.js';

export class Game {
  constructor({ renderer, hud, cardDock }) {
    this.renderer = renderer;
    this.hud = hud;
    this.cardDock = cardDock;
    this.map = MAP;
    this.deployment = new DeploymentSystem();
    this.economy = new EconomySystem();
    this.combat = new CombatSystem();
    this.ai = new AISystem();
    this.effects = [];
    this.state = null;
    this.reset();
  }

  reset() {
    this.effects = [];
    this.state = {
      elapsed: 0,
      energy: GAME_RULES.startingEnergy,
      enemyEnergy: GAME_RULES.startingEnergy,
      selectedCard: null,
      draggingCard: null,
      units: [],
      buildings: [],
      towers: this.map.towers.map(data => new Tower(data)),
      projectiles: [],
      aiTimer: 1.05,
      enemyPlays: 0,
      matchTimer: GAME_RULES.matchSeconds,
      suddenDeath: false,
      over: null
    };
    this.cardDock?.clearSelected();
    this.hud?.pushMessage('V14 loaded: real map asset, navmesh deployment and fixed enemy AI.');
  }

  update(dt) {
    this.state.elapsed += dt;
    if (!this.state.over) {
      this.state.matchTimer -= dt;
      if (this.state.matchTimer <= 0) {
        this.state.matchTimer = 0;
        this.state.suddenDeath = true;
      }
      this.economy.update(this, dt);
      this.ai.update(this, dt);
      this.combat.update(this, dt);
    } else {
      for (const effect of this.effects) effect.update(dt);
      this.effects = this.effects.filter(effect => effect.alive);
    }

    this.cardDock?.setEnergy(this.state.energy);
    this.hud?.update(this);
  }

  render() {
    this.renderer.render(this);
  }

  selectCard(cardId) {
    if (!CARD_LIBRARY[cardId]) return;
    this.state.selectedCard = this.state.selectedCard === cardId ? null : cardId;
    this.cardDock.setSelected(this.state.selectedCard);
  }

  handleWorldTap(world) {
    if (!this.state.selectedCard) {
      this.feed('Pick a card first');
      return;
    }
    const deployed = this.deploy(this.state.selectedCard, world.x, world.y, TEAM.PLAYER);
    if (deployed) {
      this.state.selectedCard = null;
      this.cardDock.clearSelected();
    }
  }

  handleCardDrop(cardId, screenX, screenY) {
    const world = this.renderer.screenToWorld(screenX, screenY);
    const deployed = this.deploy(cardId, world.x, world.y, TEAM.PLAYER);
    if (deployed) {
      this.state.selectedCard = null;
      this.cardDock.clearSelected();
    } else {
      this.state.selectedCard = cardId;
      this.cardDock.setSelected(cardId);
    }
  }

  deploy(cardId, x, y, team = TEAM.PLAYER, options = {}) {
    const deployed = this.deployment.deploy(this, cardId, x, y, team, options);
    if (deployed && team === TEAM.PLAYER) {
      const card = CARD_LIBRARY[cardId];
      this.feed(`${card.shortName} deployed on the navmesh`);
    }
    return deployed;
  }

  feed(text) {
    this.hud?.pushMessage(text);
  }

  getCore(team) {
    return this.state.towers.find(tower => tower.team === team && tower.kind === 'core');
  }

  endMatch(result) {
    if (this.state.over) return;
    this.state.over = result;
    this.feed(result === 'victory' ? 'Enemy core destroyed!' : 'Your core has fallen.');
  }
}
