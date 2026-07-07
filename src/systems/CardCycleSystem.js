import { GAME_RULES } from '../core/constants.js';

export class CardCycleSystem {
  constructor(deckIds, { handSize = GAME_RULES.handSize, shuffle = true } = {}) {
    this.baseDeck = [...deckIds];
    this.handSize = handSize;
    this.shuffle = shuffle;
    this.reset();
  }

  reset() {
    const deck = this.shuffle ? this.shuffled(this.baseDeck) : [...this.baseDeck];
    this.hand = deck.slice(0, this.handSize);
    this.queue = deck.slice(this.handSize);
    if (this.queue.length === 0) this.queue = [...deck];
  }

  has(cardId) {
    return this.hand.includes(cardId);
  }

  play(cardId) {
    const index = this.hand.indexOf(cardId);
    if (index === -1) return false;

    const next = this.queue.shift();
    this.hand.splice(index, 1, next || cardId);
    this.queue.push(cardId);
    return true;
  }

  get next() {
    return this.queue[0] || this.hand[0] || null;
  }

  shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
