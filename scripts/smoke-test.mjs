import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { PLAYER_DECK, ENEMY_DECK, CARD_LIBRARY } from '../src/data/cards.js';
import { MAP } from '../src/data/map.js';
import { MAP_IMAGE_DATA_URI } from '../src/data/mapImage.js';
import { TEAM, GAME_RULES } from '../src/core/constants.js';
import { NavigationSystem } from '../src/systems/NavigationSystem.js';
import { CardCycleSystem } from '../src/systems/CardCycleSystem.js';
import { AISystem } from '../src/systems/AISystem.js';
import { AtmosphereSystem } from '../src/systems/AtmosphereSystem.js';
import { ATMOSPHERE } from '../src/data/atmosphere.js';
import { DEFENSE_LIBRARY } from '../src/data/defenses.js';
import { CHARACTER_LIBRARY, CHARACTER_PIPELINE } from '../src/data/characters.js';
import { CharacterMotionSystem } from '../src/systems/CharacterMotionSystem.js';
import { Unit } from '../src/entities/Unit.js';

assert.ok(PLAYER_DECK.length >= 8, 'V19 should retain a deep player deck with monsters and buildings');
assert.ok(ENEMY_DECK.length >= 7, 'V19 enemy needs its own deck');
assert.equal(MAP.lanes.length, 3, 'The map should retain 3 logical path routes');
assert.ok(MAP.lanes.every(lane => lane.points.length >= 10), 'Each route should be organic with enough waypoints');
assert.ok(MAP.background.src.includes('nightmare_park_arena_v14_4k.jpg'), 'V19 should keep the embedded 4K arena asset');
assert.ok(existsSync(new URL('../assets/maps/nightmare_park_arena_v14_4k.jpg', import.meta.url)), 'Map art asset must exist');
assert.ok(statSync(new URL('../assets/maps/nightmare_park_arena_v14_4k.jpg', import.meta.url)).size > 1_000_000, 'Map art should not be tiny');
assert.ok(MAP_IMAGE_DATA_URI.startsWith('data:image/jpeg;base64,'), 'Embedded map fallback should be available');
assert.ok(MAP_IMAGE_DATA_URI.length > 1_000_000, 'Embedded map fallback should not be tiny');

for (const cardId of PLAYER_DECK) {
  const card = CARD_LIBRARY[cardId];
  assert.ok(card, `Missing card: ${cardId}`);
  assert.ok(card.name, `Card ${cardId} needs a name`);
  assert.ok(Number.isFinite(card.cost), `Card ${cardId} needs a numeric cost`);
  assert.ok(['unit', 'building'].includes(card.kind), `Card ${cardId} needs a kind`);
}

const playerCycle = new CardCycleSystem(PLAYER_DECK, { shuffle: false });
assert.equal(playerCycle.hand.length, GAME_RULES.handSize, 'Player must have a 4-card hand');
const played = playerCycle.hand[0];
const next = playerCycle.next;
assert.equal(playerCycle.play(played), true, 'Card cycle should accept a card in hand');
assert.equal(playerCycle.hand.includes(next), true, 'Next card should rotate into hand');
assert.equal(playerCycle.queue.includes(played), true, 'Played card should go to back of cycle');

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

const ai = new AISystem();
const fakeGame = {
  map: MAP,
  state: {
    over: null,
    aiTimer: -1,
    enemyEnergy: 10,
    enemyHand: ['werewolfRunner', 'skeletonSwarm', 'midnightWitch', 'cursedWatchtower'],
    enemyIntent: '', enemyLane: 1, suddenDeath: false,
    units: [], buildings: [],
    towers: MAP.towers.map(t => ({ ...t, maxHp: t.hp, alive: true }))
  },
  deployCalls: 0,
  deploy(cardId, x, y, team) {
    this.deployCalls += 1;
    const card = CARD_LIBRARY[cardId];
    return nav.resolveDeployment(MAP, card, x, y, team).ok;
  },
  feed() {},
  effects: []
};
ai.update(fakeGame, 2);
assert.ok(fakeGame.deployCalls > 0, 'Enemy AI should attempt to play a card');

assert.ok(ATMOSPHERE.torchClusters.length >= 8, 'V16 should define multiple torch clusters');
assert.ok(ATMOSPHERE.fogBands.length >= 5, 'V16 should define multiple animated fog bands');
assert.ok(ATMOSPHERE.bats.length >= 3, 'V16 should include ambient bat paths');
assert.ok(Object.keys(DEFENSE_LIBRARY).length >= 4, 'V19 should define customisable defence buildings');
assert.ok(MAP.towers.every(tower => tower.defenseId), 'Every map tower should now reference a defence building skin');
assert.ok(MAP.towers.some(tower => tower.defenseId === 'greenGateCore'), 'Player core should be a real defence building');
assert.ok(MAP.towers.some(tower => tower.defenseId === 'crimsonMausoleumCore'), 'Enemy core should be a real defence building');

const atmosphere = new AtmosphereSystem();
const fakeAtmosphereGame = {
  state: { suddenDeath: false, units: [{}, {}], projectiles: [] },
  getCore(team) { return { hp: team === TEAM.PLAYER ? 500 : 780, maxHp: 780 }; },
  feed() {}
};
atmosphere.update(fakeAtmosphereGame, 1.25);
assert.ok(atmosphere.state.time > 1, 'Atmosphere time should advance');
assert.ok(atmosphere.state.danger > 0, 'Atmosphere danger should react to match state');


const playableCharacterIds = ['mirrorClown', 'werewolfKing', 'phantomBride', 'zombieRunner', 'tinBat', 'candleImp', 'graveGoblin'];
for (const id of playableCharacterIds) {
  const profile = CHARACTER_LIBRARY[id];
  assert.ok(profile, `Missing V19 character profile for ${id}`);
  assert.ok(profile.silhouette, `${id} needs a battlefield silhouette`);
  assert.ok(profile.motion?.locomotion, `${id} needs a locomotion style`);
  assert.ok(profile.signature?.weapon, `${id} needs a weapon signature`);
  assert.ok(profile.portrait?.top, `${id} needs card portrait data`);
}

for (const id of playableCharacterIds) {
  const profile = CHARACTER_LIBRARY[id];
  assert.ok(profile.art?.sprite, `${id} needs a runtime sprite asset`);
  assert.ok(profile.art?.portrait, `${id} needs a card portrait asset`);
  const spritePath = new URL(`../${profile.art.sprite.replace(/^\.\//, '')}`, import.meta.url);
  const portraitPath = new URL(`../${profile.art.portrait.replace(/^\.\//, '')}`, import.meta.url);
  assert.ok(existsSync(spritePath), `Sprite asset missing for ${id}: ${spritePath}`);
  assert.ok(existsSync(portraitPath), `Portrait asset missing for ${id}: ${portraitPath}`);
  assert.ok(statSync(spritePath).size > 8_000, `${id} sprite should not be a tiny placeholder`);
}
assert.equal(CHARACTER_PIPELINE.version, 'V19', 'Character pipeline should identify V19');

const motionSystem = new CharacterMotionSystem();
const testUnit = new Unit({ card: CARD_LIBRARY.werewolfRunner, team: TEAM.PLAYER, laneIndex: 1, progress: 0.18, offset: 0 });
testUnit.syncPosition(MAP);
testUnit.motion.prevX = testUnit.x;
testUnit.motion.prevY = testUnit.y;
testUnit.spawnAnim = 0;
testUnit.progress += 0.015;
testUnit.syncPosition(MAP);
const fakeMotionGame = { state: { units: [testUnit] }, effects: [] };
motionSystem.update(fakeMotionGame, 0.1);
assert.ok(testUnit.motion.state === 'walk' || testUnit.motion.state === 'special', 'V19 motion system should detect walking units');
assert.ok(Number.isFinite(testUnit.motion.stride), 'V19 motion system should advance stride');
assert.ok(Array.isArray(testUnit.motion.trail), 'V19 motion system should maintain optional trails');

console.log('Nightmare Park V19 premium-visual/character-art/enemy-brain/navmesh smoke test passed.');
