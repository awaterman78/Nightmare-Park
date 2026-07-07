import assert from 'node:assert/strict';
import { PLAYER_DECK, CARD_LIBRARY } from '../src/data/cards.js';
import { MAP } from '../src/data/map.js';

assert.equal(PLAYER_DECK.length, 8, 'V13 should expose an 8-card test deck');
assert.equal(MAP.lanes.length, 3, 'The map should retain 3 logical paths');
assert.ok(MAP.lanes.every(lane => lane.points.length >= 6), 'Each path should be organic, not a 2-point line');

for (const cardId of PLAYER_DECK) {
  const card = CARD_LIBRARY[cardId];
  assert.ok(card, `Missing card: ${cardId}`);
  assert.ok(card.name, `Card ${cardId} needs a name`);
  assert.ok(Number.isFinite(card.cost), `Card ${cardId} needs a numeric cost`);
  assert.ok(['unit', 'building'].includes(card.kind), `Card ${cardId} needs a kind`);
}

console.log('Nightmare Park V13 smoke test passed.');
