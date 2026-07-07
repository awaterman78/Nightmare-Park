export const CARD_LIBRARY = Object.freeze({
  graveGoblin: {
    id: 'graveGoblin', kind: 'unit', characterId: 'graveGoblin', rarity: 'common',
    name: 'Grave Goblin', shortName: 'Goblin', icon: '🧟', cost: 2,
    role: 'Melee Pressure', tribe: 'Undead', hp: 88, speed: 35, damage: 17, range: 18, attackEvery: 0.66, radius: 11,
    targetMode: 'ground', canHitAir: false, attackType: 'melee', special: 'bleed',
    colours: ['#7dff66', '#25331e'], cardGlow: 'rgba(125,255,102,.34)',
    description: 'Cheap undead pressure with a proper scuttle, stab and leap frame set.'
  },
  bruteClown: {
    id: 'bruteClown', kind: 'unit', characterId: 'mirrorClown', rarity: 'rare',
    name: 'Mirror Clown', shortName: 'Mirror', icon: '🤡', cost: 5,
    role: 'Control Tank', tribe: 'Carnival', hp: 250, speed: 16, damage: 26, range: 24, attackEvery: 1.08, radius: 17,
    targetMode: 'ground', canHitAir: false, attackType: 'melee', special: 'mirror-stun',
    colours: ['#ff5bce', '#2b1126'], cardGlow: 'rgba(255,91,206,.34)',
    description: 'A premium control tank with mirror stun VFX and heavy sidestep movement.'
  },
  werewolfRunner: {
    id: 'werewolfRunner', kind: 'unit', characterId: 'werewolfKing', rarity: 'legendary',
    name: 'Werewolf King', shortName: 'Wolf King', icon: '🐺', cost: 4,
    role: 'Bruiser', tribe: 'Beast', hp: 150, speed: 43, damage: 23, range: 21, attackEvery: 0.7, radius: 13,
    targetMode: 'ground', canHitAir: false, attackType: 'melee', special: 'frenzy',
    colours: ['#ffd86f', '#332018'], cardGlow: 'rgba(255,216,111,.36)',
    description: 'Legendary pouncing bruiser. Frenzies below 40% health.'
  },
  midnightWitch: {
    id: 'midnightWitch', kind: 'unit', characterId: 'phantomBride', rarity: 'epic',
    name: 'Phantom Bride', shortName: 'Bride', icon: '👻', cost: 4,
    role: 'Ranged Support', tribe: 'Spectral', hp: 92, speed: 22, damage: 13, range: 98, attackEvery: 1.12, radius: 12,
    targetMode: 'all', canHitAir: true, attackType: 'projectile', projectile: 'hex', special: 'summoner', summonId: 'summonedSkeleton', summonEvery: 5.0,
    colours: ['#8eeaff', '#102238'], cardGlow: 'rgba(142,234,255,.34)',
    description: 'Floating support caster with a spectral projectile and periodic undead summon.'
  },
  skeletonSwarm: {
    id: 'skeletonSwarm', kind: 'unit', characterId: 'zombieRunner', rarity: 'rare',
    name: 'Zombie Runner', shortName: 'Zombie', icon: '🧟', cost: 3,
    role: 'Fast Swarm', tribe: 'Undead', hp: 46, speed: 38, damage: 9, range: 16, attackEvery: 0.5, radius: 8,
    targetMode: 'ground', canHitAir: false, attackType: 'melee', count: 3, special: 'swarm',
    colours: ['#9dff4a', '#223116'], cardGlow: 'rgba(157,255,74,.3)',
    description: 'Three infected runners with bite-lunge movement for lane pressure.'
  },
  gargoyle: {
    id: 'gargoyle', kind: 'unit', characterId: 'tinBat', rarity: 'common',
    name: 'Tin Bat', shortName: 'Tin Bat', icon: '🦇', cost: 3,
    role: 'Flying Swarm', tribe: 'Construct', hp: 98, speed: 31, damage: 16, range: 56, attackEvery: 0.88, radius: 10,
    targetMode: 'all', canHitAir: true, flying: true, attackType: 'projectile', projectile: 'stone', special: 'flying',
    colours: ['#88efff', '#1b2430'], cardGlow: 'rgba(136,239,255,.32)',
    description: 'Wide-wing flying unit with hover, flap and air-chip attack feel.'
  },
  pumpkinCatapult: {
    id: 'pumpkinCatapult', kind: 'unit', characterId: 'candleImp', rarity: 'common',
    name: 'Candle Imp', shortName: 'Imp', icon: '🕯️', cost: 4,
    role: 'Ranged Splash', tribe: 'Demon', hp: 92, speed: 20, damage: 25, range: 115, attackEvery: 1.35, radius: 12,
    targetMode: 'all', canHitAir: false, attackType: 'projectile', projectile: 'pumpkin', splash: 34, special: 'fire-spit',
    colours: ['#ff9b35', '#512613'], cardGlow: 'rgba(255,155,53,.34)',
    description: 'Hopping ranged imp that spits glowing fire splash.'
  },
  hauntedGrave: {
    id: 'hauntedGrave', kind: 'building', rarity: 'epic',
    name: 'Haunted Grave', shortName: 'Grave', icon: '🪦', cost: 5,
    role: 'Spawner', tribe: 'Undead', hp: 260, radius: 20, lifetime: 42, spawnId: 'summonedSkeleton', spawnEvery: 4.2,
    colours: ['#8dff75', '#172f22'], cardGlow: 'rgba(141,255,117,.32)',
    description: 'Customisable defence building that keeps coughing up minions.'
  },
  cursedWatchtower: {
    id: 'cursedWatchtower', kind: 'building', rarity: 'rare',
    name: 'Cursed Watchtower', shortName: 'Tower', icon: '🗼', cost: 4,
    role: 'Defence', tribe: 'Building', hp: 215, radius: 18, lifetime: 38, damage: 15, range: 122, attackEvery: 0.86,
    targetMode: 'all', canHitAir: true, projectile: 'bolt',
    colours: ['#88efff', '#14313d'], cardGlow: 'rgba(136,239,255,.32)',
    description: 'Customisable defensive tower. Future upgrade socket.'
  },
  summonedSkeleton: {
    id: 'summonedSkeleton', kind: 'unit', characterId: 'summonedSkeleton', rarity: 'token',
    name: 'Zombie Minion', shortName: 'Minion', icon: '☠️', cost: 0,
    role: 'Summon', tribe: 'Undead', hp: 28, speed: 32, damage: 6, range: 14, attackEvery: 0.58, radius: 6,
    targetMode: 'ground', canHitAir: false, attackType: 'melee',
    colours: ['#e9e2cf', '#4c4536'], cardGlow: 'rgba(232,225,200,.24)',
    description: 'Disposable summon. Temporary V19 minion skin.'
  }
});

export const PLAYER_DECK = Object.freeze([
  'graveGoblin',
  'bruteClown',
  'werewolfRunner',
  'midnightWitch',
  'skeletonSwarm',
  'gargoyle',
  'pumpkinCatapult',
  'hauntedGrave',
  'cursedWatchtower'
]);

export const ENEMY_DECK = Object.freeze([
  'graveGoblin',
  'werewolfRunner',
  'skeletonSwarm',
  'midnightWitch',
  'gargoyle',
  'pumpkinCatapult',
  'cursedWatchtower',
  'bruteClown',
  'hauntedGrave'
]);
