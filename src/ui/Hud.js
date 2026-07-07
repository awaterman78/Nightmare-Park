import { GAME_RULES, TEAM } from '../core/constants.js';
import { clamp, formatTime } from '../core/math.js';

export class Hud {
  constructor() {
    this.energyValue = document.getElementById('energy-value');
    this.energyMeter = document.getElementById('energy-meter');
    this.timerValue = document.getElementById('timer-value');
    this.statusValue = document.getElementById('status-value');
    this.enemyCoreValue = document.getElementById('enemy-core-value');
    this.enemyCoreMeter = document.getElementById('enemy-core-meter');
    this.feedRoot = document.getElementById('message-feed');
    this.restartButton = document.getElementById('restart-button');
  }

  update(game) {
    const energy = Math.floor(game.state.energy * 10) / 10;
    this.energyValue.textContent = Number.isInteger(energy) ? energy.toFixed(0) : energy.toFixed(1);
    this.energyMeter.style.width = `${clamp(game.state.energy / GAME_RULES.maxEnergy, 0, 1) * 100}%`;

    this.timerValue.textContent = game.state.suddenDeath ? 'SUDDEN' : formatTime(game.state.matchTimer);
    this.statusValue.textContent = game.state.over
      ? (game.state.over === 'victory' ? 'Enemy core destroyed' : 'Your core fell')
      : (game.state.selectedCard ? 'Tap or drop in your half' : 'Pick a monster card');

    const enemyCore = game.getCore(TEAM.ENEMY);
    this.enemyCoreValue.textContent = `${Math.ceil(enemyCore?.hp || 0)}`;
    this.enemyCoreMeter.style.width = `${clamp((enemyCore?.hp || 0) / (enemyCore?.maxHp || 1), 0, 1) * 100}%`;
    this.restartButton.hidden = !game.state.over;
  }

  pushMessage(text) {
    const node = document.createElement('div');
    node.className = 'message';
    node.textContent = text;
    this.feedRoot.prepend(node);
    while (this.feedRoot.children.length > 3) this.feedRoot.lastElementChild.remove();
    setTimeout(() => node.remove(), 2600);
  }
}
