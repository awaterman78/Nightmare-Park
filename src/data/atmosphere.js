// V16 living-map anchors. These are visual-only overlays aligned to the playable arena.
// They do not change navmesh rules; NavigationSystem/map.js remains the source of truth for walkability.
export const ATMOSPHERE = Object.freeze({
  torchClusters: [
    { id: 'player-left-blue', x: 94, y: 584, colour: 'rgba(124,210,255,.78)', r: 34, phase: 0.2 },
    { id: 'player-right-blue', x: 296, y: 584, colour: 'rgba(124,210,255,.78)', r: 34, phase: 1.4 },
    { id: 'player-gate-green', x: 195, y: 640, colour: 'rgba(40,255,106,.70)', r: 48, phase: 2.2 },
    { id: 'enemy-gate-green', x: 195, y: 126, colour: 'rgba(40,255,106,.62)', r: 46, phase: 0.9 },
    { id: 'enemy-left-red', x: 91, y: 196, colour: 'rgba(255,91,110,.60)', r: 32, phase: 2.7 },
    { id: 'enemy-right-red', x: 299, y: 196, colour: 'rgba(255,91,110,.60)', r: 32, phase: 4.1 },
    { id: 'west-purple', x: 55, y: 318, colour: 'rgba(179,76,255,.58)', r: 38, phase: 1.1 },
    { id: 'east-purple', x: 335, y: 318, colour: 'rgba(179,76,255,.58)', r: 38, phase: 3.3 },
    { id: 'river-west-green', x: 85, y: 374, colour: 'rgba(40,255,106,.48)', r: 42, phase: 3.8 },
    { id: 'river-east-green', x: 309, y: 374, colour: 'rgba(40,255,106,.48)', r: 42, phase: 5.1 }
  ],
  runeStones: [
    { x: 72, y: 467, r: 9, colour: 'rgba(213,140,255,.72)', phase: 0.0 },
    { x: 118, y: 508, r: 7, colour: 'rgba(125,255,102,.66)', phase: 1.2 },
    { x: 196, y: 505, r: 10, colour: 'rgba(255,216,111,.58)', phase: 2.3 },
    { x: 316, y: 465, r: 9, colour: 'rgba(213,140,255,.72)', phase: 3.6 },
    { x: 282, y: 251, r: 8, colour: 'rgba(125,255,102,.62)', phase: 4.6 },
    { x: 112, y: 252, r: 8, colour: 'rgba(125,255,102,.62)', phase: 5.2 }
  ],
  fogBands: [
    { x: 15, y: 122, w: 170, h: 26, speed: 6.5, alpha: 0.06, phase: 0.1, colour: 'rgba(136,239,255,' },
    { x: 180, y: 187, w: 190, h: 22, speed: -4.2, alpha: 0.05, phase: 1.7, colour: 'rgba(213,140,255,' },
    { x: 30, y: 338, w: 320, h: 30, speed: 8.5, alpha: 0.11, phase: 2.2, colour: 'rgba(40,255,106,' },
    { x: 55, y: 390, w: 290, h: 22, speed: -7.4, alpha: 0.075, phase: 3.2, colour: 'rgba(40,255,106,' },
    { x: 20, y: 565, w: 210, h: 24, speed: 4.6, alpha: 0.05, phase: 4.4, colour: 'rgba(136,239,255,' },
    { x: 150, y: 622, w: 220, h: 28, speed: -5.6, alpha: 0.05, phase: 5.7, colour: 'rgba(213,140,255,' }
  ],
  puddles: [
    { x: 145, y: 445, w: 34, h: 10, phase: 0.5 },
    { x: 242, y: 452, w: 38, h: 11, phase: 1.7 },
    { x: 115, y: 573, w: 30, h: 9, phase: 2.9 },
    { x: 276, y: 574, w: 30, h: 9, phase: 4.0 },
    { x: 198, y: 298, w: 42, h: 12, phase: 4.8 }
  ],
  bats: [
    { y: 108, speed: 20, phase: 0, scale: 1.0 },
    { y: 146, speed: 16, phase: 91, scale: 0.75 },
    { y: 226, speed: -14, phase: 41, scale: 0.82 },
    { y: 615, speed: 12, phase: 170, scale: 0.62 }
  ],
  carnivalSilhouettes: [
    { id: 'wheel', x: 326, y: 118, r: 32, phase: 0.5 },
    { id: 'carousel', x: 63, y: 608, r: 28, phase: 1.9 },
    { id: 'coaster', x: 318, y: 626, r: 34, phase: 3.1 }
  ],
  embers: Array.from({ length: 40 }, (_, i) => ({
    x: 28 + ((i * 57) % 335),
    y: 95 + ((i * 89) % 535),
    speed: 8 + (i % 7) * 2.4,
    size: 0.8 + (i % 4) * 0.45,
    phase: i * 0.81,
    type: i % 5 === 0 ? 'spark' : 'ash'
  }))
});
