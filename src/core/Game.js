import { GAME_RULES, TEAM } from './constants.js';
import { MAP } from '../data/map.js';
import { CARD_LIBRARY, ENEMY_DECK, PLAYER_DECK } from '../data/cards.js';
import { Tower } from '../entities/Tower.js';
import { DeploymentSystem } from '../systems/DeploymentSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { AISystem } from '../systems/AISystem.js';
import { CardCycleSystem } from '../systems/CardCycleSystem.js';
import { AtmosphereSystem } from '../systems/AtmosphereSystem.js';
import { CharacterMotionSystem } from '../systems/CharacterMotionSystem.js';

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
    this.atmosphere = new AtmosphereSystem();
    this.characterMotion = new CharacterMotionSystem();
    this.playerCycle = null;
    this.enemyCycle = null;
    this.effects = [];
    this.state = null;
    this.reset();
  }

  reset() {
    this.effects = [];
    this.atmosphere.reset();
    this.playerCycle = new CardCycleSystem(PLAYER_DECK, { shuffle: true });
    this.enemyCycle = new CardCycleSystem(ENEMY_DECK, { shuffle: true });

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
      playerHand: this.playerCycle.hand,
      playerNextCard: this.playerCycle.next,
      enemyHand: this.enemyCycle.hand,
      enemyNextCard: this.enemyCycle.next,
      aiTimer: 0.65,
      enemyPlays: 0,
      enemyLastPlay: 'Thinking...',
      enemyIntent: 'Opening pressure',
      enemyLane: 1,
      enemyMood: 'probing',
      atmosphereMood: 'breathing',
      matchTimer: GAME_RULES.matchSeconds,
      suddenDeath: false,
      suddenDeathAnnounced: false,
      over: null
    };

    this.cardDock?.setHand(this.state.playerHand);
    this.cardDock?.setNextCard(this.state.playerNextCard);
    this.cardDock?.clearSelected();
    this.hud?.pushMessage('V19 loaded: real monster art assets, premium cards and battlefield sprite renderer.');
  }

  update(dt) {
    this.state.elapsed += dt;
    this.atmosphere.update(this, dt);
    this.state.atmosphereMood = this.atmosphere.state.lastMood;
    if (!this.state.over) {
      this.state.matchTimer -= dt;
      if (this.state.matchTimer <= 0) {
        this.state.matchTimer = 0;
        this.state.suddenDeath = true;
        if (!this.state.suddenDeathAnnounced) {
          this.state.suddenDeathAnnounced = true;
          this.feed('Sudden death: energy and damage ramping up');
        }
      }
      this.economy.update(this, dt);
      this.ai.update(this, dt);
      this.combat.update(this, dt);
      this.characterMotion.update(this, dt);
    } else {
      this.characterMotion.update(this, dt);
      for (const effect of this.effects) effect.update(dt);
      this.effects = this.effects.filter(effect => effect.alive);
    }

    this.cardDock?.setEnergy(this.state.energy);
    this.cardDock?.setHand(this.state.playerHand);
    this.cardDock?.setNextCard(this.state.playerNextCard);
    this.hud?.update(this);
  }

  render() {
    this.renderer.render(this);
  }

  selectCard(cardId) {
    const card = CARD_LIBRARY[cardId];
    if (!card) return;
    if (!this.playerCycle.has(cardId)) {
      this.feed('That card is not in your current hand');
      return;
    }
    if (card.cost > this.state.energy) {
      this.feed(`${card.shortName} needs ${card.cost} energy`);
    }
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
    if (team === TEAM.PLAYER && !options.free && !this.playerCycle.has(cardId)) {
      this.feed('Card has already cycled out of your hand');
      return false;
    }
    if (team === TEAM.ENEMY && !options.free && !this.enemyCycle.has(cardId)) {
      return false;
    }

    const deployed = this.deployment.deploy(this, cardId, x, y, team, options);
    if (!deployed) return false;

    const card = CARD_LIBRARY[cardId];
    if (!options.free && team === TEAM.PLAYER) {
      this.playerCycle.play(cardId);
      this.state.playerHand = this.playerCycle.hand;
      this.state.playerNextCard = this.playerCycle.next;
      this.cardDock?.setHand(this.state.playerHand);
      this.cardDock?.setNextCard(this.state.playerNextCard);
      this.feed(`${card.shortName} deployed. Next card cycling in.`);
    }

    if (!options.free && team === TEAM.ENEMY) {
      this.enemyCycle.play(cardId);
      this.state.enemyHand = this.enemyCycle.hand;
      this.state.enemyNextCard = this.enemyCycle.next;
      this.state.enemyPlays += 1;
      this.state.enemyLastPlay = card.shortName;
    }

    return true;
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
