import { CARD_LIBRARY, PLAYER_DECK } from '../data/cards.js';

export class CardDock {
  constructor({ root, ghost, onSelect, onDrop }) {
    this.root = root;
    this.ghost = ghost;
    this.onSelect = onSelect;
    this.onDrop = onDrop;
    this.selectedCardId = null;
    this.energy = 0;
    this.dragging = null;
    this.render();
  }

  setEnergy(energy) {
    this.energy = energy;
    for (const button of this.root.querySelectorAll('.card')) {
      const card = CARD_LIBRARY[button.dataset.cardId];
      button.classList.toggle('is-disabled', card.cost > energy);
    }
  }

  setSelected(cardId) {
    this.selectedCardId = cardId;
    for (const button of this.root.querySelectorAll('.card')) {
      button.classList.toggle('is-selected', button.dataset.cardId === cardId);
    }
  }

  clearSelected() {
    this.setSelected(null);
  }

  render() {
    this.root.innerHTML = '';
    for (const cardId of PLAYER_DECK) {
      const card = CARD_LIBRARY[cardId];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'card';
      button.dataset.cardId = card.id;
      button.style.setProperty('--card-glow', card.cardGlow);
      button.style.setProperty('--card-top', card.colours[1]);
      button.style.setProperty('--card-bottom', '#0a0610');
      button.innerHTML = `
        <span class="card__cost">${card.cost}</span>
        <span class="card__icon" aria-hidden="true">${card.icon}</span>
        <span class="card__name">${card.shortName}</span>
        <span class="card__role">${card.role}</span>
      `;
      button.addEventListener('pointerdown', event => this.startDrag(event, card));
      this.root.appendChild(button);
    }
  }

  startDrag(event, card) {
    event.preventDefault();
    this.onSelect(card.id);
    this.setSelected(card.id);
    this.dragging = {
      cardId: card.id,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      pointerId: event.pointerId
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    this.showGhost(card, event.clientX, event.clientY);

    const move = moveEvent => this.moveDrag(moveEvent);
    const up = upEvent => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.endDrag(upEvent);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up, { passive: false, once: true });
  }

  moveDrag(event) {
    if (!this.dragging) return;
    event.preventDefault();
    const dx = Math.abs(event.clientX - this.dragging.startX);
    const dy = Math.abs(event.clientY - this.dragging.startY);
    if (dx + dy > 10) this.dragging.moved = true;
    this.positionGhost(event.clientX, event.clientY);
  }

  endDrag(event) {
    if (!this.dragging) return;
    event.preventDefault();
    const drag = this.dragging;
    this.dragging = null;
    this.hideGhost();

    if (drag.moved) {
      this.onDrop(drag.cardId, event.clientX, event.clientY);
    }
  }

  showGhost(card, x, y) {
    this.ghost.hidden = false;
    this.ghost.innerHTML = `
      <div style="font-size:28px">${card.icon}</div>
      <strong style="display:block;font-size:11px;line-height:1.05">${card.shortName}</strong>
      <small style="color:#ffd86f;font-weight:900">${card.cost} energy</small>
    `;
    this.positionGhost(x, y);
  }

  positionGhost(x, y) {
    this.ghost.style.left = `${x}px`;
    this.ghost.style.top = `${y}px`;
  }

  hideGhost() {
    this.ghost.hidden = true;
    this.ghost.innerHTML = '';
  }
}
