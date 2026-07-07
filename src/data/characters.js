export const CHARACTER_LIBRARY = Object.freeze({
  graveGoblin: {
    id: 'graveGoblin', displayName: 'Grave Goblin', silhouette: 'small-undead-stabber', scale: 0.98,
    motion: { locomotion: 'scuttle', cadence: 12.2, bob: 2.6, lean: 0.14, footstepEvery: 0.18, trail: true },
    signature: { weapon: 'rusted-shiv', attack: 'bleed-stab', vfx: '#7dff66', material: 'grave-moss' },
    portrait: { top: '#7dff66', bottom: '#182514', accent: '#ffd86f' },
    art: {
      sprite: './assets/characters/graveGoblin/sprite.png',
      portrait: './assets/characters/graveGoblin/portrait.png',
      frames: {
        idle: './assets/characters/graveGoblin/idle.png',
        walk: './assets/characters/graveGoblin/walk.png',
        attack: './assets/characters/graveGoblin/attack.png',
        special: './assets/characters/graveGoblin/special.png'
      },
      battlefieldHeight: 58, cardZoom: 1.15, anchorY: 0.9
    },
    notes: 'Dedicated transparent sprite states for scuttle, leap and stab. This is the first real character asset in the game.'
  },
  candleImp: {
    id: 'candleImp', displayName: 'Candle Imp', silhouette: 'small-ranged-fire-fiend', scale: 0.95,
    motion: { locomotion: 'hop', cadence: 8.8, bob: 4.2, lean: 0.08, footstepEvery: 0.24, trail: true },
    signature: { weapon: 'fire-spit', attack: 'candle-fireball', vfx: '#ff9b35', material: 'wax-flame' },
    portrait: { top: '#ff9b35', bottom: '#27100a', accent: '#ffd86f' },
    art: {
      sprite: './assets/characters/candleImp/sprite.png',
      portrait: './assets/characters/candleImp/portrait.png',
      frames: {
        idle: './assets/characters/candleImp/idle.png',
        walk: './assets/characters/candleImp/walk.png',
        attack: './assets/characters/candleImp/attack.png',
        special: './assets/characters/candleImp/special.png'
      },
      battlefieldHeight: 52, cardZoom: 1.08, anchorY: 0.88
    },
    notes: 'Ranged imp silhouette with flame glow and hopping movement.'
  },
  tinBat: {
    id: 'tinBat', displayName: 'Tin Bat', silhouette: 'wide-wing-flying-swarm', scale: 0.92,
    motion: { locomotion: 'flap', cadence: 10.4, bob: 8.2, lean: 0.15, footstepEvery: 999, trail: true },
    signature: { weapon: 'dive-peck', attack: 'air-chip', vfx: '#88efff', material: 'tin-wing' },
    portrait: { top: '#9da9b8', bottom: '#1b2430', accent: '#88efff' },
    art: {
      sprite: './assets/characters/tinBat/sprite.png',
      portrait: './assets/characters/tinBat/portrait.png',
      frames: {
        idle: './assets/characters/tinBat/idle.png',
        walk: './assets/characters/tinBat/walk.png',
        attack: './assets/characters/tinBat/attack.png',
        special: './assets/characters/tinBat/special.png'
      },
      battlefieldHeight: 47, cardZoom: 1.12, anchorY: 0.76
    },
    notes: 'Premium flying asset for the previous Gargoyle role.'
  },
  mirrorClown: {
    id: 'mirrorClown', displayName: 'Mirror Clown', silhouette: 'control-tank-carnival', scale: 1.05,
    motion: { locomotion: 'sidestep', cadence: 5.0, bob: 2.1, lean: 0.075, footstepEvery: 0.38, trail: false },
    signature: { weapon: 'mirror-stun', attack: 'control-swipe', vfx: '#ff5bce', material: 'cloth-glass-brass' },
    portrait: { top: '#ff5bce', bottom: '#241121', accent: '#88efff' },
    art: {
      sprite: './assets/characters/mirrorClown/sprite.png',
      portrait: './assets/characters/mirrorClown/portrait.png',
      frames: {
        idle: './assets/characters/mirrorClown/idle.png',
        walk: './assets/characters/mirrorClown/walk.png',
        attack: './assets/characters/mirrorClown/attack.png',
        special: './assets/characters/mirrorClown/special.png'
      },
      battlefieldHeight: 62, cardZoom: 1.03, anchorY: 0.9
    },
    notes: 'High-readability clown controller, using actual monster-roster art instead of procedural canvas.'
  },
  zombieRunner: {
    id: 'zombieRunner', displayName: 'Zombie Runner', silhouette: 'fast-infected-sprinter', scale: 0.9,
    motion: { locomotion: 'pounce', cadence: 11.2, bob: 3.2, lean: 0.15, footstepEvery: 0.18, trail: true },
    signature: { weapon: 'infected-bite', attack: 'bite-lunge', vfx: '#9dff4a', material: 'bone-slime' },
    portrait: { top: '#9dff4a', bottom: '#161d11', accent: '#88efff' },
    art: {
      sprite: './assets/characters/zombieRunner/sprite.png',
      portrait: './assets/characters/zombieRunner/portrait.png',
      frames: {
        idle: './assets/characters/zombieRunner/idle.png',
        walk: './assets/characters/zombieRunner/walk.png',
        attack: './assets/characters/zombieRunner/attack.png',
        special: './assets/characters/zombieRunner/special.png'
      },
      battlefieldHeight: 45, cardZoom: 1.18, anchorY: 0.86
    },
    notes: 'Fast swarm role with infected sprint-lunge movement.'
  },
  boneBrute: {
    id: 'boneBrute', displayName: 'Bone Brute', silhouette: 'huge-undead-tank', scale: 1.12,
    motion: { locomotion: 'stomp', cadence: 3.9, bob: 1.8, lean: 0.04, footstepEvery: 0.48, trail: false },
    signature: { weapon: 'skull-smash', attack: 'heavy-slam', vfx: '#d58cff', material: 'bone-iron' },
    portrait: { top: '#d58cff', bottom: '#191322', accent: '#ffd86f' },
    art: {
      sprite: './assets/characters/boneBrute/sprite.png',
      portrait: './assets/characters/boneBrute/portrait.png',
      frames: {
        idle: './assets/characters/boneBrute/idle.png',
        walk: './assets/characters/boneBrute/walk.png',
        attack: './assets/characters/boneBrute/attack.png',
        special: './assets/characters/boneBrute/special.png'
      },
      battlefieldHeight: 68, cardZoom: 1.02, anchorY: 0.92
    },
    notes: 'Premium tank option kept in the asset pipeline for V20 roster expansion.'
  },
  phantomBride: {
    id: 'phantomBride', displayName: 'Phantom Bride', silhouette: 'floating-support-ghost', scale: 1.0,
    motion: { locomotion: 'hover', cadence: 3.6, bob: 6.4, lean: 0.04, footstepEvery: 999, trail: true },
    signature: { weapon: 'healing-wail', attack: 'spirit-bolt', vfx: '#8eeaff', material: 'spectral-cloth' },
    portrait: { top: '#8eeaff', bottom: '#101b27', accent: '#d58cff' },
    art: {
      sprite: './assets/characters/phantomBride/sprite.png',
      portrait: './assets/characters/phantomBride/portrait.png',
      frames: {
        idle: './assets/characters/phantomBride/idle.png',
        walk: './assets/characters/phantomBride/walk.png',
        attack: './assets/characters/phantomBride/attack.png',
        special: './assets/characters/phantomBride/special.png'
      },
      battlefieldHeight: 60, cardZoom: 1.08, anchorY: 0.8
    },
    notes: 'Floating caster/support replacement for the old procedural witch.'
  },
  werewolfKing: {
    id: 'werewolfKing', displayName: 'Werewolf King', silhouette: 'legendary-beast-bruiser', scale: 1.12,
    motion: { locomotion: 'pounce', cadence: 9.6, bob: 3.8, lean: 0.17, footstepEvery: 0.2, trail: true },
    signature: { weapon: 'moon-rage-claws', attack: 'savage-charge', vfx: '#ffd86f', material: 'fur-gold-iron' },
    portrait: { top: '#ffd86f', bottom: '#21150f', accent: '#d58cff' },
    art: {
      sprite: './assets/characters/werewolfKing/sprite.png',
      portrait: './assets/characters/werewolfKing/portrait.png',
      frames: {
        idle: './assets/characters/werewolfKing/idle.png',
        walk: './assets/characters/werewolfKing/walk.png',
        attack: './assets/characters/werewolfKing/attack.png',
        special: './assets/characters/werewolfKing/special.png'
      },
      battlefieldHeight: 65, cardZoom: 1.02, anchorY: 0.9
    },
    notes: 'Legendary bruiser with pounce lean and moon-rage VFX.'
  },

  // Legacy IDs are retained so gameplay data can evolve without breaking old cards/saves.
  bruteClown: {
    id: 'bruteClown', displayName: 'Mirror Clown', aliasOf: 'mirrorClown', silhouette: 'control-tank-carnival', scale: 1.05,
    motion: { locomotion: 'sidestep', cadence: 5.0, bob: 2.1, lean: 0.075, footstepEvery: 0.38, trail: false },
    signature: { weapon: 'mirror-stun', attack: 'control-swipe', vfx: '#ff5bce', material: 'cloth-glass-brass' },
    portrait: { top: '#ff5bce', bottom: '#241121', accent: '#88efff' },
    art: { sprite: './assets/characters/mirrorClown/sprite.png', portrait: './assets/characters/mirrorClown/portrait.png', frames: { idle: './assets/characters/mirrorClown/idle.png', walk: './assets/characters/mirrorClown/walk.png', attack: './assets/characters/mirrorClown/attack.png', special: './assets/characters/mirrorClown/special.png' }, battlefieldHeight: 62, cardZoom: 1.03, anchorY: 0.9 }
  },
  werewolfRunner: {
    id: 'werewolfRunner', displayName: 'Werewolf King', aliasOf: 'werewolfKing', silhouette: 'legendary-beast-bruiser', scale: 1.12,
    motion: { locomotion: 'pounce', cadence: 9.6, bob: 3.8, lean: 0.17, footstepEvery: 0.2, trail: true },
    signature: { weapon: 'moon-rage-claws', attack: 'savage-charge', vfx: '#ffd86f', material: 'fur-gold-iron' },
    portrait: { top: '#ffd86f', bottom: '#21150f', accent: '#d58cff' },
    art: { sprite: './assets/characters/werewolfKing/sprite.png', portrait: './assets/characters/werewolfKing/portrait.png', frames: { idle: './assets/characters/werewolfKing/idle.png', walk: './assets/characters/werewolfKing/walk.png', attack: './assets/characters/werewolfKing/attack.png', special: './assets/characters/werewolfKing/special.png' }, battlefieldHeight: 65, cardZoom: 1.02, anchorY: 0.9 }
  },
  midnightWitch: {
    id: 'midnightWitch', displayName: 'Phantom Bride', aliasOf: 'phantomBride', silhouette: 'floating-support-ghost', scale: 1,
    motion: { locomotion: 'hover', cadence: 3.6, bob: 6.4, lean: 0.04, footstepEvery: 999, trail: true },
    signature: { weapon: 'healing-wail', attack: 'spirit-bolt', vfx: '#8eeaff', material: 'spectral-cloth' },
    portrait: { top: '#8eeaff', bottom: '#101b27', accent: '#d58cff' },
    art: { sprite: './assets/characters/phantomBride/sprite.png', portrait: './assets/characters/phantomBride/portrait.png', frames: { idle: './assets/characters/phantomBride/idle.png', walk: './assets/characters/phantomBride/walk.png', attack: './assets/characters/phantomBride/attack.png', special: './assets/characters/phantomBride/special.png' }, battlefieldHeight: 60, cardZoom: 1.08, anchorY: 0.8 }
  },
  skeletonSwarm: {
    id: 'skeletonSwarm', displayName: 'Zombie Runner', aliasOf: 'zombieRunner', silhouette: 'fast-infected-sprinter', scale: 0.9,
    motion: { locomotion: 'pounce', cadence: 11.2, bob: 3.2, lean: 0.15, footstepEvery: 0.18, trail: true },
    signature: { weapon: 'infected-bite', attack: 'bite-lunge', vfx: '#9dff4a', material: 'bone-slime' },
    portrait: { top: '#9dff4a', bottom: '#161d11', accent: '#88efff' },
    art: { sprite: './assets/characters/zombieRunner/sprite.png', portrait: './assets/characters/zombieRunner/portrait.png', frames: { idle: './assets/characters/zombieRunner/idle.png', walk: './assets/characters/zombieRunner/walk.png', attack: './assets/characters/zombieRunner/attack.png', special: './assets/characters/zombieRunner/special.png' }, battlefieldHeight: 45, cardZoom: 1.18, anchorY: 0.86 }
  },
  summonedSkeleton: {
    id: 'summonedSkeleton', displayName: 'Zombie Minion', silhouette: 'small-infected-summon', scale: 0.66,
    motion: { locomotion: 'skitter', cadence: 12.8, bob: 1.4, lean: 0.08, footstepEvery: 0.16, trail: false },
    signature: { weapon: 'bone-scratch', attack: 'jab', vfx: '#e8e1c8', material: 'bone' },
    portrait: { top: '#e8e1c8', bottom: '#2b271f', accent: '#7dff66' },
    art: { sprite: './assets/characters/summonedSkeleton/sprite.png', portrait: './assets/characters/summonedSkeleton/portrait.png', frames: { idle: './assets/characters/summonedSkeleton/idle.png', walk: './assets/characters/summonedSkeleton/walk.png', attack: './assets/characters/summonedSkeleton/attack.png', special: './assets/characters/summonedSkeleton/special.png' }, battlefieldHeight: 32, cardZoom: 1.2, anchorY: 0.86 }
  },
  gargoyle: {
    id: 'gargoyle', displayName: 'Tin Bat', aliasOf: 'tinBat', silhouette: 'wide-wing-flying-swarm', scale: 0.92,
    motion: { locomotion: 'flap', cadence: 10.4, bob: 8.2, lean: 0.15, footstepEvery: 999, trail: true },
    signature: { weapon: 'dive-peck', attack: 'air-chip', vfx: '#88efff', material: 'tin-wing' },
    portrait: { top: '#9da9b8', bottom: '#1b2430', accent: '#88efff' },
    art: { sprite: './assets/characters/tinBat/sprite.png', portrait: './assets/characters/tinBat/portrait.png', frames: { idle: './assets/characters/tinBat/idle.png', walk: './assets/characters/tinBat/walk.png', attack: './assets/characters/tinBat/attack.png', special: './assets/characters/tinBat/special.png' }, battlefieldHeight: 47, cardZoom: 1.12, anchorY: 0.76 }
  },
  pumpkinCatapult: {
    id: 'pumpkinCatapult', displayName: 'Candle Imp', aliasOf: 'candleImp', silhouette: 'small-ranged-fire-fiend', scale: 0.95,
    motion: { locomotion: 'hop', cadence: 8.8, bob: 4.2, lean: 0.08, footstepEvery: 0.24, trail: true },
    signature: { weapon: 'fire-spit', attack: 'candle-fireball', vfx: '#ff9b35', material: 'wax-flame' },
    portrait: { top: '#ff9b35', bottom: '#27100a', accent: '#ffd86f' },
    art: { sprite: './assets/characters/candleImp/sprite.png', portrait: './assets/characters/candleImp/portrait.png', frames: { idle: './assets/characters/candleImp/idle.png', walk: './assets/characters/candleImp/walk.png', attack: './assets/characters/candleImp/attack.png', special: './assets/characters/candleImp/special.png' }, battlefieldHeight: 52, cardZoom: 1.08, anchorY: 0.88 }
  },
  default: {
    id: 'default', displayName: 'Monster', silhouette: 'generic', scale: 1,
    motion: { locomotion: 'walk', cadence: 6, bob: 1.8, lean: 0.06, footstepEvery: 0.28, trail: false },
    signature: { weapon: 'claws', attack: 'hit', vfx: '#ffffff', material: 'shadow' },
    portrait: { top: '#7dff66', bottom: '#120b18', accent: '#ffd86f' },
    notes: 'Fallback rig.'
  }
});

export const CHARACTER_PIPELINE = Object.freeze({
  version: 'V19',
  source: 'src/data/characters.js + assets/characters/<id>/*.png',
  approach: 'Real character art is now loaded on the battlefield and in cards. The procedural rigs remain only as fallbacks, while PNG state frames, portraits, motion profiles and asset manifests provide the real art pipeline.',
  nextAssetDrop: 'Replace static PNG state frames with full multi-frame sprite sheets or Spine/Unity skeletal rigs using the same character IDs.'
});

export function characterProfile(cardId) {
  return CHARACTER_LIBRARY[cardId] || CHARACTER_LIBRARY.default;
}
