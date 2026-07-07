import { RenderSystem } from './systems/RenderSystem.js';
import { CardDock } from './ui/CardDock.js';
import { Hud } from './ui/Hud.js';
import { Game } from './core/Game.js';
import { InputController } from './core/InputController.js';

const canvas = document.getElementById('game-canvas');
const renderer = new RenderSystem(canvas);
const hud = new Hud();

let game;
const cardDock = new CardDock({
  root: document.getElementById('card-dock'),
  ghost: document.getElementById('drag-ghost'),
  onSelect: cardId => game?.selectCard(cardId),
  onDrop: (cardId, screenX, screenY) => game?.handleCardDrop(cardId, screenX, screenY)
});

game = new Game({ renderer, hud, cardDock });
new InputController({ canvas, renderer, game });

const restartButton = document.getElementById('restart-button');
restartButton.addEventListener('click', () => game.reset());

function resize() {
  renderer.resize();
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(resize, 120), { passive: true });
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  game.update(dt);
  game.render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
