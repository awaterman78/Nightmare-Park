import { FIELD } from '../core/constants.js';
import { polylineLength } from '../core/math.js';

// Logical pathing remains competitive and symmetrical, but the visible art is now organic.
// Progress is 0 at the player base and 1 at the enemy base.
const lanePoints = [
  {
    id: 'west',
    name: 'Rotten Ticket Path',
    width: 34,
    deployWidth: 48,
    points: [
      { x: 99, y: 626 },
      { x: 82, y: 582 },
      { x: 108, y: 532 },
      { x: 82, y: 478 },
      { x: 103, y: 427 },
      { x: 84, y: 390 },
      { x: 83, y: 350 },
      { x: 112, y: 304 },
      { x: 91, y: 250 },
      { x: 108, y: 202 },
      { x: 88, y: 145 }
    ]
  },
  {
    id: 'middle',
    name: 'Cursed Parade Route',
    width: 38,
    deployWidth: 52,
    points: [
      { x: 195, y: 634 },
      { x: 188, y: 584 },
      { x: 208, y: 532 },
      { x: 176, y: 484 },
      { x: 206, y: 430 },
      { x: 190, y: 395 },
      { x: 196, y: 360 },
      { x: 209, y: 315 },
      { x: 178, y: 263 },
      { x: 205, y: 204 },
      { x: 195, y: 132 }
    ]
  },
  {
    id: 'east',
    name: 'Broken Ride Walk',
    width: 34,
    deployWidth: 48,
    points: [
      { x: 292, y: 626 },
      { x: 318, y: 580 },
      { x: 281, y: 530 },
      { x: 310, y: 477 },
      { x: 287, y: 425 },
      { x: 310, y: 390 },
      { x: 309, y: 350 },
      { x: 282, y: 306 },
      { x: 306, y: 250 },
      { x: 286, y: 202 },
      { x: 303, y: 145 }
    ]
  }
];

export const LANES = lanePoints.map((lane, index) => ({
  ...lane,
  index,
  length: polylineLength(lane.points)
}));

const riverPolygon = [
  { x: 18, y: 328 },
  { x: 65, y: 314 },
  { x: 123, y: 333 },
  { x: 181, y: 322 },
  { x: 239, y: 336 },
  { x: 306, y: 319 },
  { x: 372, y: 335 },
  { x: 372, y: 409 },
  { x: 310, y: 399 },
  { x: 249, y: 418 },
  { x: 188, y: 403 },
  { x: 124, y: 416 },
  { x: 68, y: 394 },
  { x: 18, y: 404 }
];

export const MAP = Object.freeze({
  name: 'Eerie Midway Arena',
  field: FIELD,
  background: {
    src: './assets/maps/nightmare_park_arena_v14_4k.jpg',
    label: '4K-sized haunted arena artwork',
    width: 2160,
    height: 3840
  },
  lanes: LANES,
  nav: {
    unitSnapDistance: 50,
    buildingSnapDistance: 92,
    river: riverPolygon,
    debugOverlayAlpha: 0.2
  },
  river: riverPolygon,
  bridgeBands: [
    { id: 'west-bridge', x: 63, y: 335, w: 57, h: 70, rot: -0.12 },
    { id: 'middle-bridge', x: 166, y: 334, w: 58, h: 74, rot: 0.05 },
    { id: 'east-bridge', x: 274, y: 335, w: 57, h: 70, rot: 0.11 }
  ],
  blockedZones: [
    { id: 'curse-river', name: 'Cursed river', kind: 'hazard', polygon: riverPolygon },
    { id: 'enemy-base-keep', name: 'Enemy keep', kind: 'structure', circle: { x: 195, y: 120, r: 43 } },
    { id: 'player-base-keep', name: 'Player keep', kind: 'structure', circle: { x: 195, y: 643, r: 42 } },
    { id: 'left-grave-cluster', name: 'Grave cluster', kind: 'obstacle', circle: { x: 78, y: 456, r: 31 } },
    { id: 'right-grave-cluster', name: 'Grave cluster', kind: 'obstacle', circle: { x: 316, y: 456, r: 31 } },
    { id: 'central-statue', name: 'Central statue', kind: 'obstacle', circle: { x: 196, y: 505, r: 26 } },
    { id: 'enemy-statue', name: 'Enemy statue', kind: 'obstacle', circle: { x: 195, y: 257, r: 24 } }
  ],
  towers: [
    { id: 'enemy-left', team: 'enemy', laneIndex: 0, x: 91, y: 195, hp: 390, kind: 'side' },
    { id: 'enemy-core', team: 'enemy', laneIndex: 1, x: 195, y: 126, hp: 780, kind: 'core' },
    { id: 'enemy-right', team: 'enemy', laneIndex: 2, x: 299, y: 195, hp: 390, kind: 'side' },
    { id: 'player-left', team: 'player', laneIndex: 0, x: 96, y: 586, hp: 390, kind: 'side' },
    { id: 'player-core', team: 'player', laneIndex: 1, x: 195, y: 641, hp: 780, kind: 'core' },
    { id: 'player-right', team: 'player', laneIndex: 2, x: 294, y: 586, hp: 390, kind: 'side' }
  ],
  ambientLights: [
    { x: 64, y: 318, r: 42, colour: 'rgba(151, 70, 255, .35)', phase: 0.1 },
    { x: 326, y: 318, r: 42, colour: 'rgba(151, 70, 255, .35)', phase: 1.2 },
    { x: 195, y: 374, r: 86, colour: 'rgba(40, 255, 106, .24)', phase: 2.4 },
    { x: 195, y: 122, r: 68, colour: 'rgba(40, 255, 106, .18)', phase: 1.8 },
    { x: 195, y: 641, r: 74, colour: 'rgba(40, 255, 106, .18)', phase: 0.6 },
    { x: 94, y: 585, r: 48, colour: 'rgba(124, 210, 255, .22)', phase: 2.9 },
    { x: 296, y: 585, r: 48, colour: 'rgba(124, 210, 255, .22)', phase: 3.4 }
  ],
  ambientParticles: Array.from({ length: 26 }, (_, i) => ({
    x: 30 + ((i * 67) % 330),
    y: 90 + ((i * 113) % 540),
    speed: 0.25 + (i % 5) * 0.07,
    size: 1.2 + (i % 4) * 0.6,
    phase: i * 0.71
  }))
});
