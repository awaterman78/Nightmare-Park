import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { PLAYER_DECK, CARD_LIBRARY } from '../src/data/cards.js';
import { MAP } from '../src/data/map.js';
import { TEAM } from '../src/core/constants.js';
import { NavigationSystem } from '../src/systems/NavigationSystem.js';

assert.equal(PLAYER_DECK.length, 8, 'V14 should expose an 8-card test deck');
assert.equal(MAP.lanes.length, 3, 'The map should retain 3 logical path routes');
assert.ok(MAP.lanes.every(lane => lane.points.length >= 10), 'Each route should be organic with enough waypoints');
assert.ok(MAP.background.src.includes('nightmare_park_arena_v14_4k.jpg'), 'V14 should use the new 4K-sized arena asset');
assert.ok(existsSync(new URL('../assets/maps/nightmare_park_arena_v14_4k.jpg', import.meta.url)), 'Map art asset must exist');
assert.ok(statSync(new URL('../assets/maps/nightmare_park_arena_v14_4k.jpg', import.meta.url)).size > 1_000_000, 'Map art should not be a tiny placeholder');

for (const cardId of PLAYER_DECK) {
  const card = CARD_LIBRARY[cardId];
  assert.ok(card, `Missing card: ${cardId}`);
  assert.ok(card.name, `Card ${cardId} needs a name`);
  assert.ok(Number.isFinite(card.cost), `Card ${cardId} needs a numeric cost`);
  assert.ok(['unit', 'building'].includes(card.kind), `Card ${cardId} needs a kind`);
}

const nav = new NavigationSystem();
const wolf = CARD_LIBRARY.werewolfRunner;
const playerGood = nav.resolveDeployment(MAP, wolf, 195, 585, TEAM.PLAYER);
assert.equal(playerGood.ok, true, 'Player should be able to deploy on lower central path');
assert.ok(playerGood.progress < 0.5, 'Player deploy progress must be in lower half');

const riverBad = nav.resolveDeployment(MAP, wolf, 195, 390, TEAM.PLAYER);
assert.equal(riverBad.ok, false, 'River/chasm should be non-walkable');

const enemyGood = nav.resolveDeployment(MAP, wolf, 195, 205, TEAM.ENEMY);
assert.equal(enemyGood.ok, true, 'Enemy should be able to deploy on upper central path');
assert.ok(enemyGood.progress > 0.5, 'Enemy deploy progress must be in upper half');

console.log('Nightmare Park V14 map/navmesh smoke test passed.');
