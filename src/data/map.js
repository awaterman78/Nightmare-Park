import { FIELD } from '../core/constants.js';
import { polylineLength } from '../core/math.js';

const lanePoints = [
  {
    id: 'west',
    name: 'Rotten Ticket Path',
    points: [
      { x: 88, y: 618 },
      { x: 66, y: 548 },
      { x: 110, y: 485 },
      { x: 88, y: 423 },
      { x: 126, y: 352 },
      { x: 84, y: 286 },
      { x: 106, y: 218 },
      { x: 84, y: 158 }
    ]
  },
  {
    id: 'middle',
    name: 'Cursed Parade Route',
    points: [
      { x: 195, y: 626 },
      { x: 222, y: 552 },
      { x: 174, y: 488 },
      { x: 207, y: 424 },
      { x: 182, y: 354 },
      { x: 215, y: 288 },
      { x: 187, y: 218 },
      { x: 196, y: 150 }
    ]
  },
  {
    id: 'east',
    name: 'Broken Ride Walk',
    points: [
      { x: 302, y: 618 },
      { x: 326, y: 548 },
      { x: 280, y: 486 },
      { x: 312, y: 416 },
      { x: 266, y: 346 },
      { x: 318, y: 282 },
      { x: 286, y: 216 },
      { x: 304, y: 158 }
    ]
  }
];

export const LANES = lanePoints.map((lane, index) => ({
  ...lane,
  index,
  length: polylineLength(lane.points)
}));

export const MAP = Object.freeze({
  name: 'The Ruined Midway',
  field: FIELD,
  lanes: LANES,
  river: [
    { x: 20, y: 342 },
    { x: 74, y: 334 },
    { x: 122, y: 353 },
    { x: 182, y: 340 },
    { x: 240, y: 355 },
    { x: 310, y: 339 },
    { x: 370, y: 348 },
    { x: 370, y: 388 },
    { x: 310, y: 380 },
    { x: 248, y: 398 },
    { x: 188, y: 382 },
    { x: 124, y: 397 },
    { x: 74, y: 375 },
    { x: 20, y: 386 }
  ],
  bridgeBands: [
    { x: 70, y: 338, w: 50, h: 59, rot: -0.12 },
    { x: 170, y: 338, w: 54, h: 62, rot: 0.09 },
    { x: 278, y: 338, w: 52, h: 59, rot: -0.08 }
  ],
  towers: [
    { id: 'enemy-left', team: 'enemy', laneIndex: 0, x: 90, y: 198, hp: 360, kind: 'side' },
    { id: 'enemy-core', team: 'enemy', laneIndex: 1, x: 195, y: 132, hp: 720, kind: 'core' },
    { id: 'enemy-right', team: 'enemy', laneIndex: 2, x: 300, y: 198, hp: 360, kind: 'side' },
    { id: 'player-left', team: 'player', laneIndex: 0, x: 90, y: 570, hp: 360, kind: 'side' },
    { id: 'player-core', team: 'player', laneIndex: 1, x: 195, y: 632, hp: 720, kind: 'core' },
    { id: 'player-right', team: 'player', laneIndex: 2, x: 300, y: 570, hp: 360, kind: 'side' }
  ],
  decor: [
    { type: 'wheel', x: 45, y: 112, r: 36 },
    { type: 'tent', x: 316, y: 118, r: 42 },
    { type: 'tree', x: 42, y: 496, r: 34 },
    { type: 'booth', x: 324, y: 474, r: 32 },
    { type: 'carousel', x: 60, y: 636, r: 42 },
    { type: 'coaster', x: 328, y: 638, r: 44 }
  ]
});
