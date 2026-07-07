export const CHARACTER_LIBRARY = Object.freeze({
  bruteClown: {
    id: 'bruteClown',
    displayName: 'Brute Clown',
    silhouette: 'tank-horror-carnival',
    scale: 1.12,
    motion: { locomotion: 'stomp', cadence: 4.0, bob: 2.2, lean: 0.045, footstepEvery: 0.42, trail: false },
    signature: { weapon: 'mallet', attack: 'heavy-slam', vfx: '#ffd86f', material: 'rubber-cloth-brass' },
    portrait: { top: '#ff5b6e', bottom: '#28101d', accent: '#ffd86f' },
    notes: 'Huge readable tank silhouette: big boots, mallet wind-up, clown head and heavy body.'
  },
  werewolfRunner: {
    id: 'werewolfRunner',
    displayName: 'Werewolf Runner',
    silhouette: 'fast-beast-slasher',
    scale: 0.95,
    motion: { locomotion: 'pounce', cadence: 10.8, bob: 3.2, lean: 0.16, footstepEvery: 0.20, trail: true },
    signature: { weapon: 'claws', attack: 'triple-slash', vfx: '#ffd86f', material: 'fur-bone' },
    portrait: { top: '#caa06e', bottom: '#251711', accent: '#ffd86f' },
    notes: 'Low fast silhouette with claw trails, frenzy afterimages and pouncing gait.'
  },
  midnightWitch: {
    id: 'midnightWitch',
    displayName: 'Midnight Witch',
    silhouette: 'floating-caster',
    scale: 1.0,
    motion: { locomotion: 'hover', cadence: 3.4, bob: 5.5, lean: 0.035, footstepEvery: 999, trail: true },
    signature: { weapon: 'staff', attack: 'hex-bolt', vfx: '#d58cff', material: 'cloth-magic' },
    portrait: { top: '#d58cff', bottom: '#20122f', accent: '#88efff' },
    notes: 'Floating support silhouette: hat, cloak, orbiting rune and staff cast anticipation.'
  },
  skeletonSwarm: {
    id: 'skeletonSwarm',
    displayName: 'Skeleton Swarm',
    silhouette: 'skitter-swarm',
    scale: 0.78,
    motion: { locomotion: 'skitter', cadence: 13.5, bob: 1.6, lean: 0.09, footstepEvery: 0.15, trail: false },
    signature: { weapon: 'bone-dagger', attack: 'jab', vfx: '#e8e1c8', material: 'bone' },
    portrait: { top: '#e8e1c8', bottom: '#2b271f', accent: '#7dff66' },
    notes: 'Tiny jittery swarm silhouette, deliberately restless and brittle.'
  },
  summonedSkeleton: {
    id: 'summonedSkeleton',
    displayName: 'Summoned Skeleton',
    silhouette: 'small-summon',
    scale: 0.72,
    motion: { locomotion: 'skitter', cadence: 12.8, bob: 1.4, lean: 0.08, footstepEvery: 0.16, trail: false },
    signature: { weapon: 'bone-scratch', attack: 'jab', vfx: '#e8e1c8', material: 'bone' },
    portrait: { top: '#e8e1c8', bottom: '#2b271f', accent: '#7dff66' },
    notes: 'Disposable summon using the swarm animation rig at smaller scale.'
  },
  gargoyle: {
    id: 'gargoyle',
    displayName: 'Gargoyle',
    silhouette: 'flying-stone-bat',
    scale: 1.02,
    motion: { locomotion: 'flap', cadence: 8.6, bob: 7.0, lean: 0.12, footstepEvery: 999, trail: true },
    signature: { weapon: 'stone-spit', attack: 'air-chip', vfx: '#88efff', material: 'stone-wing' },
    portrait: { top: '#9da9b8', bottom: '#1b2430', accent: '#88efff' },
    notes: 'Air silhouette with wide flapping wings, floating shadow and stone chip projectile.'
  },
  pumpkinCatapult: {
    id: 'pumpkinCatapult',
    displayName: 'Pumpkin Catapult',
    silhouette: 'rolling-siege-engine',
    scale: 1.04,
    motion: { locomotion: 'trundle', cadence: 3.2, bob: 0.9, lean: 0.025, footstepEvery: 0.55, trail: false },
    signature: { weapon: 'catapult-arm', attack: 'lobbed-splash', vfx: '#ff9b35', material: 'wood-pumpkin' },
    portrait: { top: '#ff9b35', bottom: '#2a1209', accent: '#ffd86f' },
    notes: 'Slow rolling siege silhouette with wheels, arm cocking and pumpkin ammunition.'
  },
  graveGoblin: {
    id: 'graveGoblin',
    displayName: 'Grave Goblin',
    silhouette: 'small-undead-stabber',
    scale: 0.9,
    motion: { locomotion: 'scuttle', cadence: 11.2, bob: 2.4, lean: 0.12, footstepEvery: 0.19, trail: true },
    signature: { weapon: 'rusted-shiv', attack: 'bleed-stab', vfx: '#7dff66', material: 'grave-moss' },
    portrait: { top: '#7dff66', bottom: '#182514', accent: '#ffd86f' },
    notes: 'Small goblin pressure silhouette with big ears, stab lunge and green bleed burst.'
  },
  default: {
    id: 'default',
    displayName: 'Monster',
    silhouette: 'generic',
    scale: 1,
    motion: { locomotion: 'walk', cadence: 6, bob: 1.8, lean: 0.06, footstepEvery: 0.28, trail: false },
    signature: { weapon: 'claws', attack: 'hit', vfx: '#ffffff', material: 'shadow' },
    portrait: { top: '#7dff66', bottom: '#120b18', accent: '#ffd86f' },
    notes: 'Fallback rig.'
  }
});

export const CHARACTER_PIPELINE = Object.freeze({
  version: 'V18',
  source: 'src/data/characters.js',
  approach: 'Procedural canvas rigs now behave like a sprite/animation pipeline. Each monster has a silhouette, motion profile, signature weapon and VFX profile that can later be swapped for real sprite sheets or Spine-style rigs.',
  nextAssetDrop: 'Replace procedural rig renderers with exported sprite sheets under assets/characters/<character-id>/ while keeping the same IDs and motion profiles.'
});

export function characterProfile(cardId) {
  return CHARACTER_LIBRARY[cardId] || CHARACTER_LIBRARY.default;
}
